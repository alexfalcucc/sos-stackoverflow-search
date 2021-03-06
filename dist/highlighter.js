'use strict';

var cliColor = require('cli-color');

module.exports = {
    highlight: function highlight(str) {
        var tags = str.match(/(\<(\/)?[a-z](([^\>])+)?\>)/ig);
        if (tags) {

            // is probably an html code
            tags.forEach(function (tag) {
                var tagName = tag.substring(0, tag.indexOf(tag.match(/ |\>/)));
                var tagStr = undefined;

                // replace single quotes by doubles
                tagStr = tag.replace(/\=\'([^\']+)\'/g, '="$1"');

                if (tagName.length > 1) {

                    // attribute names
                    var attrs = tagStr.match(/([a-z0-9\-\_\@\$])+\=\"/ig);
                    if (attrs) {
                        attrs.forEach(function (attr) {
                            tagStr = tagStr.replace(attr, cliColor.red(attr));
                        });
                    }

                    //attribute values
                    attrs = tagStr.match(/"(?:[^"\\]|\\.)*"/g);
                    if (attrs) {
                        attrs.forEach(function (attr) {
                            tagStr = tagStr.replace(attr, cliColor.redBright(attr));
                        });
                    }

                    tagStr = tagStr.replace(new RegExp('\\' + tagName, 'ig'), cliColor.blueBright(tagName));

                    str = str.replace(tag, tagStr);
                }
            });
            str = str.replace(/\>/g, cliColor.blueBright('>'));
            str = str.replace(/\<\!DOCTYPE html(.+)?\>(.+)?/i, cliColor.bold.blackBright('<!DOCTYPE html>'));
        } else if (str.match(/(^|\n)( +)?[\.\:\#\[\]][a-z0-9\-\_\=\(\)\, \[\]]([\s\S]+)?\{/i)) {
            (function () {
                // is probably css
                var css = require('css');
                var obj = css.parse(str, { silent: true });
                var cssResult = '';

                if (!obj.parsingErrors) {
                    (function () {

                        var i = 1;
                        obj.stylesheet.rules.forEach(function (rule) {
                            var sels = [];
                            rule.selectors.forEach(function (selector) {
                                var selStr = cliColor.blueBright(selector.replace(/\[/g, cliColor.magenta('[')).replace(/\:hover/g, cliColor.redBright(":hover")).replace(/\:active/g, cliColor.redBright(":active")).replace(/\:visited/g, cliColor.redBright(":visited")).replace(/\:link/g, cliColor.redBright(":link")).replace(/\:after/g, cliColor.redBright(":after")).replace(/\:before/g, cliColor.redBright(":before")).replace(/\./g, cliColor.magenta('.')).replace(/\#/g, cliColor.magenta('.'))
                                //.replace(/\:/g, cliColor.magenta(':'))
                                .replace(/\,/g, cliColor.magenta(',')).replace(/\(/g, cliColor.magenta('(')).replace(/\)/g, cliColor.magenta(')')).replace(/\]/g, cliColor.magenta(']')).replace(/\=/g, cliColor.magenta('=')).replace(/\"/g, cliColor.magenta('"')).replace(/\'/g, cliColor.magenta("'")));
                                sels.push(selStr);
                            });
                            cssResult += sels.join(',') + '{\n';

                            rule.declarations.forEach(function (declaration) {
                                var decStr = cliColor.blueBright(cliColor.white(declaration.property) + cliColor.magenta(': ') + cliColor.redBright(declaration.value));

                                declaration = new RegExp(declaration.property + '([\s\S]+)?:([\s\S]+)?' + declaration.value, 'i');
                                cssResult += '        ' + decStr + cliColor.magenta(';\n');
                            });
                            cssResult += '}';

                            if (i < obj.stylesheet.rules.length) {
                                cssResult += '\n';
                            }
                            i++;
                        });
                    })();
                }
                str = cssResult.replace(/\{/g, cliColor.red('{')).replace(/\}/g, cliColor.red('}')).replace(/\n\nmagenta/g, cliColor.red('\n'));
            })();
        }

        return str;
    }
};