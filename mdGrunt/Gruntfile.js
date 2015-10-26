var path = require('path');
var fs = require('fs');

function dateToVersionNumber(date) {
    return '' + date.getFullYear() + padZero(date.getMonth() + 1) + padZero(date.getDate()) + padZero(date.getHours()) + padZero(date.getMinutes()) + padZero(date.getSeconds());
}
function padZero(num) {
    return (num < 10 ? '0' : '') + num;
}

module.exports = function (grunt) {

    require('time-grunt')(grunt);

    var transport = require('grunt-cmd-transport');
    var style = transport.style.init(grunt);
    var script = transport.script.init(grunt);
    var text = transport.text.init(grunt);
    grunt.file.defaultEncoding = 'utf8';
    grunt.file.preserveBOM = true;

    //任务中心md5 
    var gulp = require("gulp");
    var RevAll = require("gulp-rev-all");
    var revRep = require("gulp-rev-replace");
    var bom = require("gulp-bom");
    var gulpCopy = require("gulp-copy");
    var gulpClean = require("gulp-clean");
    var isBuildTaskMd5 = false;

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        //提取模块ID 生成临时文件放到dist文件夹
        transport: {
            options: {
                paths: ['.'],
                alias: '<%= pkg.spm.alias %>',
                debug: false,
                parsers: {
                    '.js': [script.jsParser],
                    '.css': [style.css2jsParser]
                }
            },
            global: {
                options: {
                    idleading: 'modules/'  //idleading+src 及为模块ID
                },
                files: [
                    {
                        expand: true,
                        cwd: 'modules/',  //有cwd和无cwd的区别，模块ID将不包含cwd目录
                        src: [
                            'common/**/*',
                            'uicontrol/**/*',
                            'mdcontrol/**/*'
                        ],
                        filter: 'isFile',
                        dest: 'dist/modules'
                    }
                ]
            },
            mdpublic: {
                options: {
                    idleading: 'modules/'  //idleading+src 及为模块ID
                },
                files: [
                    {
                        expand: true,
                        cwd: 'modules/',  //有cwd和无cwd的区别，模块ID将不包含cwd目录
                        src: [
                            'mdpublic/**/*',
                            '!mdpublic/images/**/*',
                            '!mdpublic/chat/**/*',
                            '!mdpublic/knowledgeCenter/**/*',
                            '!mdpublic/mdcss/**/*'
                        ],
                        filter: 'isFile',
                        dest: 'dist/modules'
                    }
                ]
            },
            mdcalendar: {
                options: {
                    idleading: 'Apps/calendar/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'Apps/calendar',
                        src: [
                            'modules/comm/**/*',
                            'modules/calendarEdit/**/*',
                            'modules/calendar/**/*',
                            'modules/toolbar/**/*',
                            'modules/calendarDetail/**/*'
                        ],
                        filter: 'isFile',
                        dest: 'dist/Apps/calendar/'
                    }
                ]
            },
            mdtask: {
                options: {
                    idleading: 'Apps/task/'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'Apps/task/',
                        src: [
                            //comm
                            "modules/comm/*.js", 
                            //uicontrol
                            'modules/uiControl/dailogLayer/**/*',
                            'modules/uiControl/createFolder/**/*',
                            'modules/uiControl/reply/**/*',
                            'modules/uiControl/userMessageLayer/**/*',
                            'modules/uiControl/quickCreateTask/**/*',
                            //pagejs
                            'modules/leftNavFolder/**/*',
                            'modules/otherTasks/**/*',
                            'modules/searchAll/**/*',
                            'modules/taskList/**/*',
                            'modules/taskTree/**/*',
                            'modules/taskStage/**/*',
                            'modules/taskSlideDetail/**/*',
                            'modules/batchTask/**/*',
                            'modules/taskCenter/**/*'

                        ],
                        filter: 'isFile',
                        dest: 'dist/Apps/task/'
                    }
                ]
            },
            webchat: {
                options: {
                   // idleading: 'dist/',
                    parsers: {
                        '.js': [script.jsParser],
                        '.css': [style.css2jsParser],
                        '.html': [text.html2jsParser]
                    }
                },
                files: [{
                    expand: true,
                    cwd: '',//限定目录
                    src: [
                        'modules/mdpublic/chat/**/*',
                        'webchat/2/**/*',//要处理的文件
                        "webchat/fullScreen/modules/lib/mentionInput/**/*",
                        "webchat/fullScreen/modules/lib/dot/**/*",
                        "webchat/fullScreen/modules/lib/emotion/**/*",
                    ],
                    filter: 'isFile',
                    dest: 'dist/'//处理完成后的目标目录
                }]
            }

        },
        //替换图片相对路径为绝对路径
        imgpathreplace: {
            mdpublic: {
                src: [
                    'dist/modules/uicontrol/**/*.js',
                    'dist/modules/mdcontrol/**/*.js',
                    'dist/modules/mdpublic/**/*.js',
                    'dist/Apps/calendar/modules/**/*.js',
                    'dist/Apps/task/modules/**/*.js',
                    'dist/webchat/2/**/*.js'
                ],
                dir: ['', '']
            }
        },
        //根据require的模块，拼接成一个文件
        concat: {
            options: {
                paths: ['dist'],
                include: 'relative', //以相对路径require的方式合并成一个文件
                uglify: {
                    beautify: false,
                    comments: true
                }
            },
            global: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: [
                            'modules/common/**/*.js',
                            'modules/mdcontrol/**/*.js',
                            'modules/uicontrol/**/*.js'
                        ],
                        dest: 'dist/',
                    }
                ]
            },
            mdpublic: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: 'modules/mdpublic/**/*.js',
                        dest: 'dist/',
                    }
                ]
            },
            mdcalendar: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: 'Apps/calendar/modules/**/*.js',
                        dest: 'dist/',
                    }
                ]
            },
            mdtask: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['Apps/task/modules/**/*.js'],
                        dest: 'dist/'
                    }
                ]
            },
            webchat: {
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',//限定目录
                        src: [//处理对象
                            'webchat/2/**/*.js',//要处理的文件
                            "webchat/fullScreen/modules/lib/mentionInput/**/*.js",
                            "webchat/fullScreen/modules/lib/dot/**/*.js",
                            "webchat/fullScreen/modules/lib/emotion/**/*.js"
                        ],
                        dest: 'dist/'//处理完成后的目标目录
                    }
                ]
            }
        },
        //js脚本压缩
        uglify: {
            options: {
                compress: {
                    drop_console: true
                },
                report: 'gzip'
            },
            mdpublic: {
                options: {
                    sourceMap: false,
                    sourceMapIn: function (jspath) {
                        var mappath = jspath + '.map';
                        if (fs.existsSync(mappath))
                            return mappath;
                    },
                    mangle: {
                        except: ['require', 'module', 'exports', 'seajs', 'jQuery', '$', '_', 'iviewer', 'cursorGrab', 'nicescroll' ]
                    }
                },
                files: [
                    {
                        expand: true,
                        src: [
                            'modules/jquery/**/*.js'
                        ],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: [
                                'modules/common/**/*.js',
                                'modules/mdcontrol/**/*.js',
                                'modules/uicontrol/**/*.js',
                                'modules/mdpublic/**/*.js',
                                'Apps/calendar/modules/**/*.js',
                                'Apps/task/modules/**/*.js',
                                'webchat/**/*.js'
                             ],
                        dest: 'dist/'
                    }
                ]
            },
            kc: {
                src: ['modules/mdpublic/knowledgeCenter/js/*.js'
                    , 'modules/uicontrol/underscore/underscore.js'],
                dest: 'dist/modules/mdpublic/knowledgeCenter/js/kc.js'
            },
            attachment: {
                src: ['modules/mdcontrol/attachment/js/*.js'
                    , 'modules/uicontrol/underscore/underscore.js'
                    , 'modules/uicontrol/artDialog/dialog.js'
                    , 'modules/uicontrol/jqueryMousewheel/jquery.mousewheel.js'
                    , 'modules/uicontrol/iviewer/jquery.iviewer.js'
                    , 'modules/uicontrol/cursorGrab/js/jquery.cursorGrab.js'
                    , 'modules/mdcontrol/doT/doT.js'],
                dest: 'dist/modules/mdcontrol/attachment/js/attachment.js'
            },
            mdcompressor: {
                files: {
                    'build/file/md.compressor/javascript/plug.all.js': [
                        'JqueryUI/jquery-1.8.3.min.js',
                        'JqueryUI/jquery.tools.1.27.nojq.min.js',
                        'JqueryUI/jquery.ui.1.9.2.min.js',
                        'javascript/lazyloadimg.js',
                        'JqueryUI/jquery.browse.js'
                    ],
                    'build/file/md.compressor/javascript/md.all.js': [
                        'MDScript/com/ScrollTo/MD.ScrollTo.js',
                        'MDScript/com/AutoTextarea/MD.AutoTextarea.js',
                        'MDScript/com/Pager/MD.Pager.js',
                        'MDScript/com/Sort/MD.clickSort.js',
                        'MDScript/ui/MD.UI.Tooltip.js',
                        'MDScript/ui/MD.UI.Dialog.js',
                        'MDScript/ui/MD.UI.PopupButton.js',
                        'MDScript/template/dot.js',
                        'UIControl/metioninput/js/MD.mentionsInput.js',
                        'UIControl/poshytip/MD.poshytip.js',
                        'UIControl/favicojs/favico.js',
                        'MDScript/md.global.js',
                        'javascript/function.js',
                        'javascript/grouplist.js'
                    ],
                    'build/file/md.compressor/javascript/player.all.js': [
                        'UIControl/FlexPaper/js/swfobject/swfobject.js',
                        'MDScript/com/PicPlayer/MD.PicPlayer.js',
                        'MDScript/com/DocPlayer/MD.DocPlayer.js',
                        'MDScript/com/DocPlayer/MD.VideoPlayer.js',
                        'MDScript/com/DocPlayer/MD.AudioVideoPlayer.js',
                        'MDScript/com/VideoPlayer/MD.VideoPlayer.js',
                        'MDScript/com/DocPlayer/MD.AttachmentPlayer.js'
                    ],
                    'build/file/md.compressor/javascript/updater.all.js': [
                        'UIControl/uploadify/jquery.uploadify-3.1.js',
                        'UIControl/ZeroClipboard/ZeroClipboard.min.js',
                        'Apps/knowledge/javascript/knowledge_search.js',
                        'MDScript/com/SelectGroup/MD.SelectGroup.js',
                        'MDScript/com/Plupload/MD.Plupload.js',
                        'MDScript/com/GroupUserManage/MD.BatchInvite.js',
                        'MDScript/com/UploadAttachment/uploadAttachment.js',
                        'javascript/facebase.js'
                    ],
                    'build/file/md.compressor/javascript/md.select.js': [
                        'javascript/pie.js',
                        'MDScript/com/CustomSelect/MD.CustomSelect.js',
                        'MDScript/com/ScrollBar/MD.jscrollpane.min.js',
                        'MDScript/com/ScrollBar/MD.mousewheel.js'
                    ],
                    'build/file/md.compressor/javascript/dialog.all.js': [
                        'MDScript/com/TextboxList/MD.TextboxList.js',
                        'javascript/dialog.js'
                    ],
                    'build/file/md.compressor/javascript/task_calendar.all.js': [
                        'UIControl/DateRange/js/daterangepicker.jQuery.js',
                        'javascript/createtask.js',
                        'UIControl/timepicker/jquery.timepicker.min.js',
                        'javascript/createcalendar.js',
                        'javascript/invitecalendar.js',
                        'apps/taskcenter/javascript/editor.js',
                        'apps/taskcenter/javascript/xss.js'
                    ],
                    'build/file/md.compressor/javascript/md.im.js': [
                        'webchat/imscript/sly/sly.js',
                        'webchat/imscript/sly/plugins.js',
                        'MDScript/com/VideoPlayer/MD.VideoPlayer.js',
                        'JqueryUI/jquery.contextmenu.r2.js',
                        'webchat/imscript/top_up.js',
                        'webchat/imscript/config.js',
                        'webchat/imscript/uuid.js',
                        'webchat/imscript/socket/im.io.js',
                        'webchat/imscript/im.js',
                        'webchat/imscript/monitor.js',
                        'webchat/imscript/chat.js',
                    ]
                }
            },
            minfile: {
                files: [
                    {
                        expand: true,
                        src: [
                            'bqq/**/*.js',
                            'jqueryui/**/*.js',
                            'mdscript/**/*.js',
                            'uicontrol/**/*.js',
                            'javascript/**/*.js',
                            'vote/**/*.js'
                        ],
                        dest: 'build/file/'
                    },
                    {
                        expand: true,
                        src: [
                            'modules/jquery/**/*.js',
                            '!modules/jquery/**/*-debug.js',
                            'modules/seajs/**/*.js',
                            'modules/global.js',
                            'modules/seajs-config.js'
                        ],
                        dest: 'build/file/dist/'
                    }
                ]
            },
            minwebfile: {
                files: [
                    {
                        expand: true,
                        src: ['Apps/**/*.js', 'Apps/calendar/**/*.js', '!Apps/**/*/node_modules/**/*.js'],
                        dest: 'build/web/'
                    },
                    {
                        expand: true,
                        src: ['m/**/*.js'],
                        dest: 'build/web/'
                    }
                ]
            }
        },
        //文件copy
        copy: {
            tpl: {
                files: [
                    {
                        expand: true,
                        src: [
                            'modules/**/*.{html,htm}',
                            '!modules/react/**/*.{html,htm}',
                            'Apps/calendar/modules/**/*.html',
                            'Apps/task/modules/**/*.html',
                            'webchat/**/*.html'
                            
                        ],
                        dest: 'dist/'
                    }
                ]
            },
            image: {
                files: [
                    {
                        expand: true,
                        src: [
                                'modules/**/*.{png,jpg,gif}',
                                '!modules/react/**/*.{png,jpg,gif}',
                                'modules/react/dist/**/*',
                                'Apps/calendar/images/**/*.{png,jpg,gif}',
                                'Apps/task/modules/**/*.{png,jpg,gif}',
                                'webchat/2/**/*.{png,gif,jpg}',
                                "!webchat/fullScreen/modules/lib/emotion/**/*.{png,gif,jpg}"
                        ],
                        dest: 'dist/'
                    }
                ]
            },
            font: {
                files: [
                    {
                        expand: true,
                        src: ['css/font/**/*'],
                        dest: 'build/file/'
                    },
                    {
                        expand: true,
                        src: ['modules/mdpublic/mdcss/font/**/*'],
                        dest: 'build/file/dist/'
                    }
                ]
            },
            website: {
                files: [
                    {
                        expand: true,
                        src: [
                            '**/*',
                            
                            '!*.htm',
                            '!views/staticPage/**/*',
                            '!m/contact.htm',
                            '!m/mdworld.htm',
                            '!m/team.htm',
                            '!m/features.htm',
                            '!m/mobile.htm',
                            '!m/upgrade.htm',
                            '!Bin/*.pdb',
                            '!Bin/*.refresh',
                            '!favicon.ico',
                            '!Global.asax',
                            '!Gruntfile.js',
                            '!gulpfile.js',
                            '!package.json',
                            '!sina_verified_check.txt',
                            '!website.publishproj',
                            '!Web.config',
                            '!App_Data/**/*',
                            '!DLL/**/*',
                            '!build/**/*',
                            '!node_modules/**/*',
                            '!apps/task/node_modules/**/*',
                            '!modules/react/**/*',
                            'modules/react/dist/**/*',
                            '!service/**/*',
                            '!tempfiles/**/*',
                            '!Themes/**/*',
                            '!aspnet_client/**/*',
                            '!Apps/task/node_modules/**/*',
                            '!Apps/task/task_bak/**/*',
                            '!Apps/task/gulpfile.js',
                            '!Apps/task/package.json'
                        ],
                        dest: 'build/web/'
                    }
                ]
            },
            minfile: {
                files: [
                    {
                        expand: true,
                        cwd: "build/file/",
                        src: [
                            'bqq/**/*',
                            'javascript/**/*',
                            'jqueryui/**/*',
                            'mdscript/**/*',
                            'uicontrol/**/*',
                            'vote/**/*'
                        ],
                        dest: 'build/web/'
                    }
                ]
            }
        },
        //清理文件
        clean: {
            spm: [
                '.build',
                'dist/**/*.map',
                'dist/**/*.css.js',
                'dist/**/*-debug.js',

                'build/web/App_Data',
                'build/web/DLL',
                'build/web/build',
                'build/web/node_modules',
                'build/web/modules/react/node_modules',
                'build/web/service',
                'build/web/tempfiles',
                'build/web/Themes',
                'build/web/Apps/task/node_modules',
                'build/web/Apps/task/task_bak'
            ],
            tempfile: [
                'build',
                'dist'
            ]
        },
        //css压缩
        cssmin: {
            modules: {
                options: {
                    sourceMap: false
                },
                files: [
                    {
                        expand: true,
                        src: ['modules/**/*.css', '!modules/react/**/*.css'],
                        dest: 'dist/'
                    }
                ]
            },
            mdcompressor: {
                files: {
                    'build/file/css/md.all.css': [
                        'css/basic.css',
                        'css/inbox.css',
                        'css/inStyle.css',
                        'css/admin.css',
                        'css/group.css',
                        'css/apps.css',
                        'css/post.css',
                        'css/search.css',
                        'css/basecenter.css',
                        'css/account.css',
                        'css/upgrade.css',
                        'css/feedFoot.css',
                        'css/corner.css',
                        'css/font-awesome.css',
                        'webchat/css/webchat.css'
                    ],
                    'build/file/css/md.jqueryui.css': [
                        'JqueryUI/themes/base/jquery.ui.theme.css',
                        'JqueryUI/themes/base/jquery.ui.core.css',
                        'JqueryUI/themes/base/jquery.ui.accordion.css',
                        'JqueryUI/themes/base/jquery.ui.autocomplete.css',
                        'JqueryUI/themes/base/jquery.ui.button.css',
                        'JqueryUI/themes/base/jquery.ui.datepicker.css',
                        'JqueryUI/themes/base/jquery.ui.dialog.css',
                        'JqueryUI/themes/base/jquery.ui.menu.css',
                        'JqueryUI/themes/base/jquery.ui.progressbar.css',
                        'JqueryUI/themes/base/jquery.ui.resizable.css',
                        'JqueryUI/themes/base/jquery.ui.selectable.css',
                        'JqueryUI/themes/base/jquery.ui.slider.css',
                        'JqueryUI/themes/base/jquery.ui.spinner.css',
                        'JqueryUI/themes/base/jquery.ui.tooltip.css',
                        'JqueryUI/themes/base/jquery.ui.tabs.css',
                        'MDScript/ui/css/MD.UI.css'
                    ],
                    'build/file/css/md.com.css': [
                        'MDScript/com/TextboxList/css/MD.TextboxList.css',
                        'MDScript/com/SelectGroup/css/MD.SelectGroup.css',
                        'MDScript/com/SelectAllGroup/css/MD.SelectAllGroup.css',
                        'MDScript/com/TextboxList/css/MD.TextboxList.css',
                        'MDScript/com/CustomSelect/css/MD.CustomSelect.css',
                        'MDScript/com/PicPlayer/css/MD.PicPlayer.css',
                        'MDScript/com/DocPlayer/css/MD.DocPlayer.css',
                        'MDScript/com/DocPlayer/css/MD.AttachmentPlayer.css',
                        'MDScript/com/UploadAttachment/css/uploadAttachment.css',
                        'MDScript/com/Sort/css/MD.clickSort.css',
                        'MDScript/com/GroupUserManage/css/MD.BatchInvite.css',
                        'UIControl/metioninput/css/MD.mentionsInput.css',
                        'UIControl/poshytip/css/MD.tip.css',
                        'UIControl/timepicker/jquery.timepicker.css',
                        'UIControl/DateRange/css/ui.daterangepicker.css',
                        'UIControl/uploadify/uploadify.css',
                        'Apps/knowledge/css/basic.css',
                        'Apps/taskcenter/css/editor.css'
                    ]
                }
            },
            minfile: {
                files: [
                    {
                        expand: true,
                        src: ['jqueryui/**/*.css'],
                        dest: 'build/file/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['mdscript/**/*.css'],
                        dest: 'build/file/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['uicontrol/**/*.css'],
                        dest: 'build/file/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['vote/**/*.css'],
                        dest: 'build/file/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['modules/mdpublic/mdcss/*.css'],
                        dest: 'build/file/dist/',
                        ext: '.css'
                    }
                ]
            },
            minwebfile: {
                files: [
                    {
                        expand: true,
                        src: ['Apps/**/*.css'],
                        dest: 'build/web/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['css/**/*.css'],
                        dest: 'build/web/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['modules/**/*.css', '!modules/react/**/*.css'],
                        dest: 'build/web/',
                        ext: '.css'
                    },
                    {
                        expand: true,
                        src: ['m/**/*.css'],
                        dest: 'build/web/',
                        ext: '.css'
                    }
                ]
            }
        },
        //模块ID替换，去掉"dist"; 合并的脚本引用方式替换
        replace: {
            html: {
                options: {
                    patterns: [
                        {
                            match: /<!--{-->(\r|\n|.)*?<!--}-->/,
                            replacement: ""
                        },
                        {
                            match: /<!--#((\r|\n|.)*?)#-->/,
                            replacement: '$1'
                        },
                        {
                            match: /(<link(.*)href=(.*)\?v=)(\w+)((.*)\/>)/g,
                            replacement: '$1' + (new Date().getFullYear() + "0" + (new Date().getMonth() + 1) + "" + new Date().getDate()) + '$5'
                        },
                        {
                            match: /(<script(.*)src=(.*)\?v=)(\w+)((.*)><\/script>)/g,
                            replacement: '$1' + (new Date().getFullYear() + "0" + (new Date().getMonth() + 1) + "" + new Date().getDate()) + '$5'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        src: [
                            '*.htm',
                            'views/staticPage/**/*.htm',
                            'views/staticPage/getIP/**/*',
                            'm/contact.htm',
                            'm/mdworld.htm',
                            'm/team.htm',
                            'm/features.htm',
                            'm/upgrade.htm',
                            'm/mobile.htm',
                            'm/upgrade.htm'
                        ],
                        dest: 'build/html/'
                    }
                ]
            },
            web: {
                options: {
                    patterns: [
                        {
                            match: /<!--{-->(\r|\n|.)*?<!--}-->/g,
                            replacement: ""
                        },
                        {
                            match: /\/\*{\*\/(\r|\n|.)*?\/\*}\*\//g, /*#*/  /*#*/ /*.cs文件*/
                            replacement: ""
                        },
                        {
                            match: /<!--#((\r|\n|.)*?)#-->/g,
                            replacement: '$1'
                        },
                        {
                            match: /\/\*#((\r|\n|.)*?)#\*\//g, /*.cs文件*/
                            replacement: '$1'
                        },
                        {
                            match: /(<link(.*)href=(.*)\?v=)(\w+)((.*)\/>)/g,
                            replacement: '$1' + (+new Date()) + '$5'
                        },
                        {
                            match: /(<script(.*)src=(.*)\?v=)(\w+)((.*)><\/script>)/g,
                            replacement: '$1' + (+new Date()) + '$5'
                        }
                    ]
                },
                files: [
                    {
                        expand: true,
                        src: [
                            'Site.master',
                            'Site.master.cs',
                            'MasterPage.master',
                            'MasterPage.master.cs',
                            'SiteApps.master',
                            'SiteApps.master.cs',
                            'siteSeajsApps.master',
                            'siteSeajsApps.master.cs',
                            'Apps/App.master',
                            'Apps/App.master.cs'
                        ],
                        dest: 'build/web/'
                    }
                ]
            },
            seajsBaseDist: {
                options: {
                    patterns: [{
                        match: /(\s*base\s*:\s*")\/(",\s*)/,
                        replacement: '$1/dist/$2'
                    }]
                }
                , files: {'modules/seajs-config.js': 'modules/seajs-config.js'}
            },
            version: {
                options: {
                    patterns: [{
                        match: /(public static string FileVersion = "\?v=)\d+(";)/,
                        replacement: '$1' + dateToVersionNumber(new Date()) + '$2'
                    }, {
                        match: /(\[\/\^\(\.\*\\\.\(\?:css\|js\|htm\)\)\(\\\?\.\*\)\?\$\/i, '\$1\?)\d+('\])/,
                        replacement: '$1' + dateToVersionNumber(new Date()) + '$2'
                    }]
                }
                , files: {
                    'modules/seajs-config.js': 'modules/seajs-config.js',
                    'App_Code/Function.cs': 'App_Code/Function.cs'
                }
            }
        },
        //MSBUILD
        msbuild: {
            dev: {
                src: ['../MDCenter_Public.sln'],
                options: {
                    projectConfiguration: 'Debug',
                    targets: ['Clean', 'Rebuild'],
                    version: 4.0,
                    maxCpuCount: 4,
                    buildParameters: {
                        WarningLevel: 0
                    },
                    verbosity: 'quiet'
                }
            }
        },
        gulp: {

            //拷贝文件
            copyMdTask: function () {
                //是否需要遍历
                if (require("fs").existsSync("Apps/task/task_bak/")) {
                    console.log("存在copyMdTask return");
                    return;
                };
                isBuildTaskMd5 = true;
                return gulp.src(["Apps/task/modules/**/*", "Apps/task/*.{aspx,aspx.cs}"])
                       .pipe(gulpCopy("Apps/task/task_bak", { prefix: 2 }));
            },
            //删除原始文件
            cleanModule: function () {
                //是否需要遍历
                if (!isBuildTaskMd5) {
                    console.log("存在copyMdTask return");
                    return;
                };

                return gulp.src(["Apps/task/modules"]).pipe(gulpClean());
            },
            //生成md5
            mdTaskRev: function () {

                //不存在才生成
                if (!isBuildTaskMd5) {
                    console.log("没有执行mdTaskMD5生成");
                    return;
                };

                var revAll = new RevAll({

                    replacer: function (fragment, replaceRegExp, newReference, referencedFile) {
                        fragment.contents = fragment.contents.replace(replaceRegExp, function (word, i) {
                            if (word.indexOf(".") != -1) {
                                return word.replace(replaceRegExp, "$1" + newReference + "$3$4");
                            } else {
                                return word;
                            }
                        });
                    },
                    transformFilename: function (file, hash) {
                        var path = require("path");
                        var ext = path.extname(file.path);
                        return path.basename(file.path, ext) + "_" + hash.substr(0, 5) + ext;
                    }
                });

                return gulp.src("Apps/task/task_bak/modules/**/*.{css,js,png,jpg,gif,html}")
                    .pipe(revAll.revision())
                    .pipe(gulp.dest("Apps/task/modules"))
                    .pipe(revAll.manifestFile())
                    .pipe(gulp.dest("Apps/task/modules/rev"));


            },
            //替换 aspx
            mdTaskRevPath: function () {

                //存在才替换路径
                if (!isBuildTaskMd5) {
                    console.log("没有执行mdTask路径替换");
                    return;
                };

                var manifest = gulp.src("Apps/task/modules/rev/*.json");
                return gulp.src("Apps/task/*.aspx")
                    .pipe(revRep({
                        manifest: manifest,
                        replaceInExtensions: [".aspx"]
                    }))
                    .pipe(bom()) // encoding for vs utf8 with bom
                    .pipe(gulp.dest('Apps/task/'));

            },

            delMoudle: function () {
                if (!require("fs").existsSync("Apps/task/task_bak/")) {
                    console.log("不存在copyMdTask return");
                    return;
                };
                return gulp.src(["Apps/task/modules"]).pipe(gulpClean());
            },
            //恢复任务路径替换
            resetMoudle: function () {

                if (!require("fs").existsSync("Apps/task/task_bak/")) {
                    console.log("不存在 resetMoudle return");
                    return;
                }

                return gulp.src("Apps/task/task_bak/**/*")
                        .pipe(gulpCopy("Apps/task/", {
                            prefix: 3
                        }));
            },
            //删除任务bak
            delBak: function () {
                return gulp.src(["Apps/task/task_bak"]).pipe(gulpClean());
            }


        }
    });

    grunt.loadNpmTasks('grunt-cmd-transport');
    grunt.loadNpmTasks('grunt-cmd-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-img-path-replace');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-msbuild');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-gulp');

    //压缩所有css
    grunt.registerTask('build-cssmin', ['cssmin:modules']);

    //1.提取ID
    grunt.registerTask('build-transport', ['transport']);

    //2.替换图片路径
    grunt.registerTask('build-imgpathreplace', ['imgpathreplace']);

    //3.压缩
    grunt.registerTask('build-uglify', ['uglify:mdpublic',
                                        'uglify:kc',
                                        'uglify:attachment']);

    grunt.registerTask('build-concat', ['concat:global',
                                        'concat:mdpublic',
                                        'concat:mdcalendar',
                                        'concat:mdtask',
                                        'concat:webchat']);

    grunt.registerTask('build-copy', ['copy:tpl',
                                      'copy:image']);



    //Task MD5 replace
    grunt.registerTask('build-mdtaskMD5', ['gulp:copyMdTask', 'gulp:cleanModule', 'gulp:mdTaskRev', 'gulp:mdTaskRevPath']);
    grunt.registerTask('reset-mdtaskMD5', ['gulp:delMoudle', 'gulp:resetMoudle', 'gulp:delBak']);

    //dist下的文件
    grunt.registerTask('default', [
        'clean:tempfile',
        'reset-mdtaskMD5',
        'build-mdtaskMD5',
        'build-cssmin',
        'build-transport',
        'build-imgpathreplace',
        'build-uglify',
        'build-concat',
        'build-copy',
        'clean:spm'
    ]);

    //单独清理
    grunt.registerTask('reset', [
        'clean:tempfile',
        'reset-mdtaskMD5'
    ]);

    //html
    grunt.registerTask('build-html', ['replace:html']);

    //tengine
    grunt.registerTask('build-file', ['uglify:mdcompressor', 'cssmin:mdcompressor', 'uglify:minfile', 'cssmin:minfile', 'copy:font']);

    //压缩网站脚本
    grunt.registerTask('build-web', ['copy:website', 'copy:minfile', 'uglify:minwebfile', 'cssmin:minwebfile', 'replace:web']);

    grunt.registerTask('build-website', ['build-html', 'build-file', 'build-web', 'clean:spm']);

    grunt.registerTask('build-all', ['replace:seajsBaseDist', 'replace:version', 'msbuild:dev', 'default', 'build-website'])


};