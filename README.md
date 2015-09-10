# gulp-ftp-git

---

A simple gulp task enable auto uploading to ftp server after git push to remote.

### Dependencies

* `Node.js`
* `gulp`
* `gulp-git`
* `vinyl-ftp`
* `yargs`

### Usage

Include the dependencies in your `package.json` file. and run
```
$ npm install
```

Set up git environment and remote server. Push your first commit to remote server. (Do it in your own way)
```
$ git init
$ git remote add origin <path to remote>
$ git add .
$ git commit -m "first commit"
$ git push origin master
```

Create a task for your push task in your `gulpfile.js`.  
**OR**  
Clone / Download [gulpfile.js](gulpfile.js) into your project directory.

After making modification and committed, run the git push command with gulp.
```
$ gulp push [-r/--remote <remote name> || default: origin] [-b/--branch <branch name> || default: master]
```

And... done! The task automatically upload changed files and delete removed files.
