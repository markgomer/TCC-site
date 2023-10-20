import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-strategy';
//import Dropbox from 'dropbox';
import * as Dropbox from 'dropbox';

export default class Backend {
    constructor(dropboxConfig, sessionConfig) {
        this.dropboxConfig = dropboxConfig;
        this.sessionConfig = sessionConfig;
    }

    setupExpress(app) {
        // Middleware setup
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(session(this.sessionConfig));
        app.use(express.static('public')); // set up static files (like CSS)
        app.set('view engine', 'ejs'); // using EJS as the template engine
        app.use(passport.initialize());
    }

    /**
     * Use Passport.js for authentication. For now, I'll just simulate 
     * a single user stored in a variable to keep things simple. 
     * In a real application, you would fetch this information from a 
     * database.
     */
    setupPassport(passport) {
        // Mock user
        const user = {
            id: 1,
            username: 'tcc',
            password: '2023'
        };

        passport.use(new LocalStrategy(
            function (username, password, done) {
                if (username === user.username && password === user.password) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid credentials.' });
                }
            }
        ));

        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function (id, done) {
            if (id === user.id) {
                done(null, user);
            } else {
                done({ message: 'User not found' }, null);
            }
        });
    }

    setupRoutes(app) {
        /**
         * Render the EJS Templates.
         */
        app.get('/', (req, res) => {
            res.render('home'); // Render the 'home.ejs' template
        });

        app.get('/login', (req, res) => {
            res.render('login'); // Render the 'login.ejs' template
        });

        app.post('/login', passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));

        app.get('/logout', (req, res) => {
            req.logout();
            res.redirect('/');
        });
    }

    async fetchJsonFilesFromDropbox(dbx, folderPath) {
        let allFiles = [];
        try {
            const folderData = await dbx.filesListFolder({ path: folderPath });
            const filePromises = folderData.result.entries.map(async (entry) => {
                if (entry.name.endsWith('.json')) {
                    const fileData = await dbx.filesDownload({ path: entry.path_lower });
                    //console.log("fileData:", fileData);
                    return JSON.parse(fileData.result.fileBinary.toString('utf8'));
                }
            });
            const allFiles = await Promise.all(filePromises);
            allFiles = allFiles.filter(Boolean);  // Filter out any undefined values
        } catch (error) {
            console.error('Error fetching files:', error);
        }
        return allFiles;
    }

    start() {
        const app = express();
        const dbx = new Dropbox(this.dropboxConfig);

        this.setupExpress(app);
        this.setupPassport(passport);
        this.setupRoutes(app);

        app.get('/dashboard', async (req, res) => {
            const jsonFiles = await this.fetchJsonFilesFromDropbox(dbx, '/Aplicativos/TCCPUCPR2023');
            // Now `jsonFiles` contains the JSON content of all the .json files in the folder.
            res.json(jsonFiles);
        });

        /**
         * Finally, let's start our server.
         */
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }

}
