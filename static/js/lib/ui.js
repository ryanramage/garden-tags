var db = require('db').use('_db');
var session = require('session');
var dashboard_db = require('db').use('_couch/dashboard');
var replicator_db = require('db').use('_couch/_replicator');
var handlebars = require('handlebars');
var async = require('async');
var _ = require('underscore')._;

var ddocName = 'tags';

var routes = {
    '/all' : tags_all,
    '/new' : tags_new,
    '/tree' : tags_tree,
    '/sync' : sync_setup,
    '/show/:tagHash' : tags_show
};


var router = Router(routes);
router.init('/all');


function activeNav(what) {
    $('.container-fluid .nav li').removeClass('active');
    $('.container-fluid .nav li.' + what).addClass('active');
}

function tags_all() {
    activeNav('all');
    db.getView(ddocName, 'all_tags', {include_docs:true}, function(err, resp) {
        $('.main').html(handlebars.templates['tags-all.html'](resp, {}));
    });

}

var createHash = function(text) {
    return text.toLowerCase().replace(/ /g, '_');
}

function tags_new() {
    activeNav('new');
    $('.main').html(handlebars.templates['tags-new.html']({}, {}));


    $('form input[name="name"]').change(function() {
        var hash = createHash($(this).val());

        $('form input[name="hash"]').val(hash);
    })

    $('.btn-primary').click(function() {
        var hash = $('#hash').val();
        if (!hash) hash = createHash($('#name').val());

        var tag = {
            type : 'garden.tag',
            name : $('#name').val(),
            hash : hash,
            description: $('#description').val()
        };

        db.saveDoc(tag, function(err, response) {
                router.setRoute('/all');
            }
        );
        return false;
    });

    $('.cancel').click(function() {
        return false;
    })
}

function tags_show(tagHash) {
    activeNav('tree');
    db.getDoc()
}

function tags_tree() {
    activeNav('tree');
}

function isAdminParty (userCtx) {
    if (!userCtx) return false;
    if (userCtx.name == null && userCtx.roles.indexOf('_admin') >= 0 ) return true;
    return false;
}


function isAdmin(userCtx) {
    if (!userCtx) return false;
    if (!userCtx.name) return false;
    if (!userCtx.roles) return false;
    if (userCtx.roles.indexOf('_admin') === -1) return false;

    return true;
}

var userCtx;
var login_link;
session.on('change', function(ctx) {
    userCtx = ctx;
    login_link = $('#dashboard-topbar-session').data('login');
})

function sync_setup() {
    activeNav('sync');
    if (!userCtx) {
        session.info(function(err, info) {
            adminSection();
        })
    } else (adminSection());

}



function adminSection() {

    $('.main').html(handlebars.templates['sync.html']({}));
    if (isAdmin(userCtx) || isAdminParty(userCtx)) {
        $('.admin-only').hide();
        replicator_db.allDocs({include_docs:true},function(err, data) {
            if (err) return humane.error(err);

            var tags_replicating = _.filter(data.rows, function(row){
                if (!row.doc.garden_tag_sync) return false;
                if (row.doc._replication_state !==  "triggered") return false;
                if (!row.doc.continuous) return false;
                return true;
            });
            console.log(tags_replicating);
            $('.replicating').html(handlebars.templates['replicating.html']({tags_replicating : tags_replicating}));


            async.series([
                function(callback) {
                    dashboard_db.getView('dashboard', 'by_active_install', {include_docs: true}, function(err, result) {
                        if (err) return humane.error(err);
                        var apps = _.map(result.rows, function(row) {
                            return { name : row.key, db : row.doc.installed.db }
                        })

                        callback(null, apps);
                    });

                },
                function(callback) {
                    dashboard_db.allDbs(function(err, data) {
                        if (err) return humane.error(err);
                        var normaldbs = _.filter(data, function(db){ if (db[0]!=='_') return true;   });
                        var dbs = _.map(normaldbs, function(db){ return {name: db, db: db } } );
                        callback(null, dbs);
                    });
                }
            ], function(err, results) {
                var options = _.flatten(results);
                console.log(options);
                $('.new-sync').html(handlebars.templates['sync_choices.html']({options: options}));


                $('form').on('submit', function(){
                    try {
                        var db_to_sync = $('#db_to_sync').val();
                        startSync(db_to_sync);
                    } catch(ignore){ console.log(ignore)}
                    return false;
                });
            });
        })
    } else $('.admin-only').show();
}

function startSync(db_to_sync) {
    db.info(function(err, resp) {
        var tags_db = resp.db_name;


        // from tags to other
        var replication_doc_to_other = {
            source : tags_db,
            target : db_to_sync,
            continuous : true,
            filter : ddocName + '/tags_only',
            garden_tag_sync : true
        };
        replicator_db.saveDoc(replication_doc_to_other, function(err, resp) {

        });

    })

}
