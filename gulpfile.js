var gulp = require('gulp'),
    git = require('gulp-git'), // git
    gutil = require('gulp-util'), // log
    ftp = require('vinyl-ftp'), // ftp
    argv = require('yargs').argv, // pass arguments
    fs = require('fs'); // load file

// function to upload to ftp server
function upload(list) {
    var conn = ftp.create({
        host:     'your.host.name', // ftp host name
        user:     'username', // ftp username
        password: 'password', // ftp password
        parallel: 10,
        log:      gutil.log
    });
    var remotePath = '/path/to/remote'; // the remote path on the server you want to upload to

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
}

gulp.task('push', function() {
    // the remote name, default 'origin'
    var remote = argv.r === undefined && argv.remote === undefined ? 'origin' : argv.r || argv.remote,
    // the local and remote branch, default 'master'
        branch = argv.b === undefined && argv.branch === undefined ? 'master' : argv.b || argv.branch;

    // get diffs between local and remote.
    // max buffer 1024 * 1024
    return git.exec({args: 'diff --name-status ' + remote + '/' + branch + ' ' + branch, maxBuffer: 1024 * 1024}, function(err, stdout) {
        if (err) throw err;

        var list = stdout;

        list = list.trim().split('\n').map(function(line) {
            var a = line.split('\t');
            return {
                type: a[0],
                path: a[1]
            };
        });

        // save last list to cache
        fs.writeFileSync('.gulp-ftp-git-cache.json', JSON.stringify(list));

        // push to remote
        return git.push(remote, branch, function(err) {
            if (err) throw err;

            upload(list);
        });
    });
});


gulp.task('upload', function() {
    var list = JSON.parse(fs.readFileSync('.gulp-ftp-git-cache.json'));

    return upload(list);
});
