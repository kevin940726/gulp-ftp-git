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

##### Example
[gulpfile.js](gulpfile.js)
```js
var gulp = require('gulp'),
    git = require('gulp-git'), // git
    gutil = require('gulp-util'), // log
    ftp = require('vinyl-ftp'), // ftp
    argv = require('yargs').argv; // pass arguments


gulp.task('push', function() {
    // the remote name, default 'origin'
    var remote = argv.r === undefined && argv.remote === undefined ? 'origin' : argv.r || argv.remote,
    // the local and remote branch, default 'master'
        branch = argv.b === undefined && argv.branch === undefined ? 'master' : argv.b || argv.branch;

    // get diffs between local and remote.
    return git.exec({args: 'diff --name-status ' + remote + '/' + branch + ' ' + branch}, function(err, stdout) {
        if (err) throw err;

        var list = stdout;

        list = list.trim().split('\n').map(function(line) {
            var a = line.split('\t');
            return {
                type: a[0],
                path: a[1]
            };
        });

        // push to remote
        return git.push(remote, branch, function(err) {
            if (err) throw err;

            var conn = ftp.create({
                host:     'your.host.name', // ftp host name
                user:     'username', // ftp username
                password: 'password', // ftp password
                parallel: 10,
                log:      gutil.log
            });
            var remotePath = '/path/to/remote/'; // the remote path on the server you want to upload to

            // added and modified files
            var changes = list.reduce(function(a, cur) {
                if (cur.type !== 'D' && cur.type.length)
                    a.push(cur.path);
                return a || [];
            }, []);
            // deleted files
            var deletes = list.reduce(function(a, cur) {
                if (cur.type === 'D' && cur.type.length)
                    a.push(cur.path);
                return a || [];
            }, []);

            // upload added and modified files
            gulp.src(changes, { base: '.', buffer: false })
                .pipe(conn.dest(remotePath));
            // delete removes files
            deletes.map(function(d) {
                conn.delete(remotePath + d, function(err) {
                    if (err) throw err;
                });
            });
        });
    });
});
```

After making modification and committed, run the git push command with gulp.
```
$ gulp push [-r/--remote <remote name> || default: origin] [-b/--branch <branch name> || default: master]
```

And... done! The task automatically upload changed files and delete removed files.
