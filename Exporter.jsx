/** NAME:
* 	BP Exporter Script 1.2

*   DESCRIPTION:
*	Exports images (png's and jpg's) from a multi-layered Adobe Photoshop document into
*   the desired location, in the same structure as in the Photoshop document.
*
* REQUIRES:
* 	Adobe Photoshop CS2 or higher
* 
* Updates:
*   v1.1
*   Fixed a bug that caused the [img] tag to not work properly
*   Updated the output to properly form the json files (who knew that the autodefines would work with correctly formed json files?)
*   v1.2
*   Manifest files for V3 added
*
*/

#target photoshop;
app.bringToFront();

// Global Variables
var doc = app.activeDocument,
    docPath = doc.path,
    activeLayer = doc.activeLayer;

var prefs = new Object();

prefs.default = '.png';
prefs.png = '.png';
prefs.jpg = '.jpg';
prefs.xml = '.xml';
prefs.imgOnly = '[img]';
prefs.posOnly = '[pos]';
prefs.ignore = '[na]';
prefs.manifestFile = 'manifest_static.json';
prefs.fileQuality = 100;
prefs.filePath = docPath.toString();
prefs.manifest = true;
prefs.trim = true;
prefs.coords = true;
prefs.version = app.version.split('.')[0];
prefs.count;

var layer = [],
    group = [];

var allLayers = new Object();

allLayers.layers = layer;
allLayers.groups = group;

function main() {
    if (showDialog() === 1) {
        var documentCopy = doc.duplicate();
        doc = documentCopy;

        var progressBarWindow = createProgressBar();
        if (!progressBarWindow) {
            return 'cancel';
        }

        prefs.count = countLayers(documentCopy);
        var collected = processLayers(documentCopy, allLayers, progressBarWindow, prefs.count);

        documentCopy.close(SaveOptions.DONOTSAVECHANGES);
        documentCopy = null;

        if (prefs.trim) {
            if (prefs.coords) {
                alert(
                    'Export Completed.\n' +
                        prefs.count +
                        ' Trimmed images have been exported to:\n ' +
                        prefs.filePath.toString().replace('%20', ' ') +
                        '\n' +
                        'with their corresponding coordinates',
                    'Export Completed'
                );
            } else if (prefs.manifest) {
                alert(
                    'Export Completed.\n' +
                        prefs.count +
                        ' Images have been exported to:\n ' +
                        prefs.filePath.toString().replace('%20', ' ') +
                        '\n' +
                        'and a manifest file has been saved to' +
                        prefs.filePath.toString().replace('%20', ' ') +
                        '/manifest/' +
                        prefs.manifestFile,
                    'Export Completed'
                );
            } else {
                alert('Export Completed.\n' + prefs.count + ' Trimmed images have been exported to:\n ' + prefs.filePath.toString().replace('%20', ' '), 'Export Completed');
            }
        } else {
            if (prefs.coords) {
                alert(
                    'Export Completed.\n' +
                        prefs.count +
                        ' Images have been exported to:\n ' +
                        prefs.filePath.toString().replace('%20', ' ') +
                        '\n' +
                        'with their corresponding coordinates',
                    'Export Completed'
                );
            } else if (prefs.manifest) {
                alert(
                    'Export Completed.\n' +
                        prefs.count +
                        ' Images have been exported to:\n ' +
                        prefs.filePath.toString().replace('%20', ' ') +
                        '\n' +
                        'and a manifest file has been saved to' +
                        prefs.filePath.toString().replace('%20', ' ') +
                        '/manifest/' +
                        prefs.manifestFile,
                    'Export Completed'
                );
            } else {
                alert('Export Completed.\n' + prefs.count + ' Images have been exported to:\n ' + prefs.filePath.toString().replace('%20', ' '), 'Export Completed');
            }
        }
    }
}

function processLayers(parent, allLayers, progressBarWindow, count) {
    for (var i = 0; i < allLayers.groups.length; i++) {
        var group = allLayers.groups[i],
            ignoreLayer = group.name.indexOf(prefs.ignore, 0) > -1,
            ignoreGroup = group.parent.name.indexOf(prefs.ignore, 0) > -1;
        if (!ignoreGroup) {
            if (!ignoreLayer) {
                saveFolder(group);
            }
        }
    }
    for (var i = 0; i < allLayers.layers.length; i++) {
        var layer = allLayers.layers[i],
            layerName = layer.name,
            layerName = getFolder(layer, layerName),
            bounds = layer.bounds,
            boundsLeft = bounds[0].value,
            boundsTop = bounds[1].value,
            boundsRight = bounds[2].value,
            boundsBottom = bounds[3].value,
            ignoreLayer = 0,
            imgOnly = layer.name.indexOf(prefs.imgOnly, 0) > -1,
            posOnly = layer.name.indexOf(prefs.posOnly, 0) > -1,
            jpg = layer.name.lastIndexOf(prefs.jpg) > -1,
            ignoreLayer = layer.name.indexOf(prefs.ignore, 0) > -1,
            ignoreGroup = layer.parent.name.indexOf(prefs.ignore, 0) > -1;

        layer.visible = false;

        if (!ignoreGroup) {
            if (!ignoreLayer) {
                makeVisible(layer);

                if (progressBarWindow) {
                    showProgressBar(progressBarWindow, 'Exporting ' + (i + 1) + ' of ' + count + '...', count);
                }

                // remove [img] and [pos] from layer names for export
                if (imgOnly) {
                    layerName = layerName.replace(prefs.imgOnly, '');
                } else if (posOnly) {
                    layerName = layerName.replace(prefs.posOnly, '');
                }

                // do stuff to the layerName to make them work with everything
                if (jpg) {
                    layerName = layerName;
                    layerName = File(prefs.filePath + '/' + layerName);
                } else {
                    layerName = File(prefs.filePath + '/' + layerName + prefs.png);
                }

                if (!imgOnly) {
                    if (prefs.coords) {
                        fileName = layerName.toString().slice(0, -4);

                        if (jpg) {
                            layer.name = layer.name.slice(0, -4);
                            prefs.png = prefs.jpg;
                        } else {
                            prefs.png = prefs.default;
                        }
                        processCoords(layer, fileName);
                    }
                }

                if (prefs.trim) crop(boundsTop, boundsRight, boundsBottom, boundsLeft);

                // save files
                if (jpg) {
                    if (!posOnly) SaveJPG(layerName);
                } else {
                    if (!posOnly) SavePNG(layerName);
                }
                // Save coordinates if wanted
                if (prefs.trim) undo(app.activeDocument);

                layer.visible = false;

                if (progressBarWindow) {
                    updateProgressBar(progressBarWindow, i);
                }
            }
            if (progressBarWindow) {
                progressBarWindow.hide();
            }
        }
    }

    if (prefs.manifest) {
        saveManifest();
    }

    return allLayers;
}

function showDialog() {
    // build dialog
    var dlg = new Window('dialog', 'Blueprint Exporter');
    dlg.orientation = 'column';

    // Location of export
    dlg.locGrp = dlg.add('group', undefined, 'Output Location');
    dlg.edittext = dlg.locGrp.add('edittext', undefined, prefs.filePath);
    dlg.btnBrowse = dlg.locGrp.add('button', undefined, 'Browse...');

    // Script Information Panel
    dlg.scriptInfoPanel = dlg.add('panel', undefined, 'Script Info');
    dlg.scriptInfo = dlg.scriptInfoPanel.add(
        'statictext',
        undefined,
        "'" +
            prefs.jpg +
            "'" +
            ': add the ' +
            "'" +
            prefs.jpg +
            "' suffix to a layer to save it as a " +
            "'" +
            prefs.jpg +
            "' file instead of a " +
            prefs.png +
            "\n\n'" +
            prefs.posOnly +
            "': prefix  '" +
            prefs.posOnly +
            "' on a layer to just output the .coords.json and atlas.json files\n\n'" +
            prefs.imgOnly +
            "': prefix '" +
            prefs.imgOnly +
            "' to just output the image with no .json files\n\n'" +
            prefs.ignore +
            "': prefix '" +
            prefs.ignore +
            "' on a layer to totally ignore that layer/group from the output",
        { multiline: true, alignment: 'left' }
    );

    // Checkbox Information Panel
    dlg.chkboxInfoPanel = dlg.add('panel', undefined, 'Checkbox Info');
    dlg.chkboxInfo = dlg.chkboxInfoPanel.add(
        'statictext',
        undefined,
        'Trim: Trim layers to their layer bounds\n\nExport Coordinates: Export the .coords.json and .atlas.json files',
        { multiline: true, alignment: 'left' }
    );

    // Options
    dlg.OptionsGrp = dlg.add('group', undefined, 'Output Location');

    dlg.trim = dlg.OptionsGrp.add('checkbox', undefined, 'Trim');
    dlg.coords = dlg.OptionsGrp.add('checkbox', undefined, 'Export Coordinates files for V2');
    dlg.manifest = dlg.OptionsGrp.add('checkbox', undefined, 'Export Manifest file for V3');

    // Default values
    dlg.trim.value = true;
    dlg.coords.value = true;
    dlg.manifest.value = false;

    // Sizes
    dlg.scriptInfo.preferredSize = [410, 95];
    dlg.chkboxInfo.preferredSize = [410, 45];
    dlg.edittext.maximumSize = [352, 0];
    dlg.edittext.minimumSize = [352, 0];

    // Browse for export location
    dlg.btnBrowse.onClick = function () {
        var fldr = Folder(prefs.filePath).selectDlg('Project Location:');
        if (fldr) {
            dlg.edittext.text = fldr;
            prefs.filePath = fldr;
        }
    };
    // Change the preferences when the checkboxes change
    dlg.trim.onClick = function () {
        dlg.trim.value === true ? (prefs.trim = true) : (prefs.trim = false);
    };

    dlg.coords.onClick = function () {
        if (dlg.coords.value === true) {
            prefs.coords = true;
            prefs.manifest = false;
            dlg.manifest.value = false;
        } else {
            prefs.coords = false;
        }
    };

    dlg.manifest.onClick = function () {
        if (dlg.manifest.value === true) {
            prefs.manifest = true;
            prefs.coords = false;
            dlg.coords.value = false;
        } else {
            prefs.manifest = false;
        }
    };

    // remainder of UI
    var uiButtonRun = 'Run';
    var uiButtonClose = 'Close';
    dlg.btngrp = dlg.add('group', undefined, 'Output Location');
    dlg.btnRun = dlg.btngrp.add('button', undefined, uiButtonRun);
    dlg.btnClose = dlg.btngrp.add('button', undefined, uiButtonClose);

    // Close the interface and run
    dlg.btnRun.onClick = function () {
        dlg.close(1);
    };
    // Close the
    dlg.btnClose.onClick = function () {
        dlg.close(0);
        return;
    };

    dlg.center();
    return dlg.show();
}

function processCoords(layer, layerName) {
    var file, fileName;
    bounds = layer.bounds;
    layer.name = layer.name.toString();

    exportAtlas(layer, layerName);
    exportCoords(layer, layerName);
}

function exportCoords(layer, fileName) {
    file = new File(fileName + '.coords.json');

    if (file.exists) {
        file.remove();
    }

    file.encoding = 'UTF-8';
    file.open('w', 'TEXT', '????');
    $.os.search(/windows/i) != -1 ? (file.lineFeed = 'windows') : (file.lineFeed = 'macintosh');

    // Layer Bounds
    var layerWidth = bounds[2].value.toFixed(0) - bounds[0].value.toFixed(0);
    var layerHeight = bounds[3].value.toFixed(0) - bounds[1].value.toFixed(0);
    var xPos = bounds[0].value.toFixed(0);
    var yPos = bounds[1].value.toFixed(0);

    file.write('{\n');
    file.write('\t"' + layer.name + '": {\n');

    file.write('\t\t' + '"image": ' + '"' + layer.name + prefs.png + '",\n');

    file.write('\t\t' + '"x": ' + xPos + ',\n');
    file.write('\t\t' + '"y": ' + yPos + '\n');
    file.write('\t}\n');
    file.write('}');

    file.close();
    file = null;
}

function exportAtlas(layer, fileName) {
    file = new File(fileName + '.atlas.json');

    if (file.exists) {
        file.remove();
    }

    file.encoding = 'UTF-8';
    file.open('w', 'TEXT', '????');
    $.os.search(/windows/i) != -1 ? (file.lineFeed = 'windows') : (file.lineFeed = 'macintosh');

    // Layer Bounds
    var layerWidth = bounds[2].value.toFixed(0) - bounds[0].value.toFixed(0);
    var layerHeight = bounds[3].value.toFixed(0) - bounds[1].value.toFixed(0);
    var xPos = bounds[0].value.toFixed(0);
    var yPos = bounds[1].value.toFixed(0);

    file.write('{\n');
    file.write('\t"' + layer.name + '": {\n'); //open

    file.write('\t\t"meta": {\n\t\t\t"size": {\n\t\t\t\t"w": ' + layerWidth + ',\n\t\t\t\t"h": ' + layerHeight + '\n\t\t\t},\n'); //meta

    file.write('\t\t\t"image" : "' + layer.name + prefs.png + '",\n\t\t\t"scale": 1,\n\t\t\t"version": "1.0"\n\t\t},\n'); //meta

    file.write('\t\t"frames": [\n\t\t\t{\n\t\t\t\t"trimmed": false,\n\t\t\t\t"spriteSourceSize": {\n\t\t\t\t\t"x": ' + xPos + ',\n\t\t\t\t\t"y": ' + yPos + ',\n'); //frames
    file.write('\t\t\t\t\t"w": ' + layerWidth + ',\n\t\t\t\t\t"h": ' + layerHeight + '\n\t\t\t\t},\n'); //frames
    file.write('\t\t\t\t"defaultPos": {\n\t\t\t\t\t"x": ' + xPos + ',\n\t\t\t\t\t"y": ' + yPos + '\n\t\t\t\t},\n'); //frames

    file.write('\t\t\t\t"filename": "' + layer.name + '",\n'); //frames

    file.write('\t\t\t\t"frame": {\n\t\t\t\t\t"x": ' + xPos + ',\n\t\t\t\t\t"y": ' + yPos + ',\n'); //frames
    file.write('\t\t\t\t\t"w": ' + layerWidth + ',\n\t\t\t\t\t"h": ' + layerHeight + '\n\t\t\t\t},\n'); //frames
    file.write('\t\t\t\t"sourceSize": {\n\t\t\t\t\t"w": ' + layerWidth + ',\n\t\t\t\t\t"h": ' + layerHeight + '\n\t\t\t\t}\n'); //frames
    file.write('\t\t\t}\n\t\t]\n\t}\n');
    file.write('}');

    file.close();
    file = null;
}

function saveManifest() {
    var folder = new Folder(prefs.filePath + '/manifest');
    if (!folder.exists) {
        folder.create();
    }
    var file = new File(folder + '/' + 'static_manifest.json');

    if (file.exists) {
        file.remove();
    }

    file.encoding = 'UTF-8';
    file.open('w', 'TEXT', '????');
    $.os.search(/windows/i) != -1 ? (file.lineFeed = 'windows') : (file.lineFeed = 'macintosh');

    file.write('{\n\t"graphics": [\n');

    for (var i = 0; i < allLayers.layers.length; i++) {
        var layer = allLayers.layers[i],
            layerName = layer.name,
            imgOnly = layer.name.indexOf(prefs.imgOnly, 0) > -1,
            posOnly = layer.name.indexOf(prefs.posOnly, 0) > -1,
            jpg = layer.name.lastIndexOf(prefs.jpg) > -1,
            ignoreLayer = layer.name.indexOf(prefs.ignore, 0) > -1,
            ignoreGroup = layer.parent.name.indexOf(prefs.ignore, 0) > -1;

        if (!ignoreGroup) {
            if (!ignoreLayer) {
                if (!imgOnly) {
                    if (posOnly) {
                        layerName = layerName.replace(prefs.posOnly, '');
                    }

                    // do stuff to the layerName to make them work with everything
                    if (jpg) {
                        layerName = layerName.replace(prefs.jpg, '');
                        var extension = prefs.jpg;
                    } else {
                        layerName = layerName;
                        var extension = prefs.png;
                    }

                    var layerFolder = getFolder(layer, layerName),
                        bounds = layer.bounds,
                        boundsLeft = bounds[0].value,
                        boundsTop = bounds[1].value,
                        boundsRight = bounds[2].value,
                        boundsBottom = bounds[3].value,
                        layerWidth = bounds[2].value.toFixed(0) - bounds[0].value.toFixed(0),
                        layerHeight = bounds[3].value.toFixed(0) - bounds[1].value.toFixed(0),
                        xPos = bounds[0].value.toFixed(0),
                        yPos = bounds[1].value.toFixed(0);

                    var enFolder = layerFolder.search(/^en\//);
                    if (enFolder > -1) {
                        layerFolder = layerFolder.replace('en/', '');
                    }

                    file.write('\t\t{\n');
                    file.write('\t\t\t"name": ' + '"' + layerName + '",\n');
                    file.write('\t\t\t"path": ' + '"' + layerFolder + extension + '",\n');
                    file.write('\t\t\t"pos": {\n');
                    file.write('\t\t\t\t"x": ' + xPos + ',\n');
                    file.write('\t\t\t\t"y": ' + yPos + '\n');
                    file.write('\t\t\t}\n');
                    if (i < allLayers.layers.length - 1) {
                        file.write('\t\t},\n');
                    } else {
                        file.write('\t\t}\n');
                    }
                }
            }
        }
    }

    file.write('\t],\n\t"bitmapfonts": [],\n\t"name": "genericengine"\n}');

    file.close();
    file = null;
}

function selectAllLayers() {
    var ref = new ActionReference();
    ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    var desc = new ActionDescriptor();
    desc.putReference(cTID('null'), ref);
    executeAction(sTID('selectAllLayers'), desc, DialogModes.NO);
}

function makeVisible(layer) {
    layer.visible = true;

    var current = layer.parent;
    while (current) {
        if (!current.visible) {
            current.visible = true;
        }
        current = current.parent;
    }
}

function crop(t, r, b, l) {
    var idCrop = cTID('Crop');
    var desc21 = new ActionDescriptor();
    var idT = cTID('T   ');
    var desc22 = new ActionDescriptor();
    var idTop = cTID('Top ');
    var idPxl = cTID('#Pxl');
    desc22.putUnitDouble(idTop, idPxl, t);
    var idLeft = cTID('Left');
    var idPxl = cTID('#Pxl');
    desc22.putUnitDouble(idLeft, idPxl, l);
    var idBtom = cTID('Btom');
    var idPxl = cTID('#Pxl');
    desc22.putUnitDouble(idBtom, idPxl, b);
    var idRght = cTID('Rght');
    var idPxl = cTID('#Pxl');
    desc22.putUnitDouble(idRght, idPxl, r);
    var idRctn = cTID('Rctn');
    desc21.putObject(idT, idRctn, desc22);
    var idAngl = cTID('Angl');
    var idAng = cTID('#Ang');
    desc21.putUnitDouble(idAngl, idAng, 0.0);
    var idDlt = cTID('Dlt ');
    desc21.putBoolean(idDlt, true);
    var idcropAspectRatioModeKey = sTID('cropAspectRatioModeKey');
    var idcropAspectRatioModeClass = sTID('cropAspectRatioModeClass');
    var idpureAspectRatio = sTID('pureAspectRatio');
    desc21.putEnumerated(idcropAspectRatioModeKey, idcropAspectRatioModeClass, idpureAspectRatio);
    var idCnsP = cTID('CnsP');
    desc21.putBoolean(idCnsP, false);
    executeAction(idCrop, desc21, DialogModes.NO);
}

function SavePNG(saveFile) {
    exportOptionsSaveForWeb = new ExportOptionsSaveForWeb();
    exportOptionsSaveForWeb.format = SaveDocumentType.PNG;
    exportOptionsSaveForWeb.dither = Dither.NONE;
    exportOptionsSaveForWeb.quality = prefs.fileQuality;
    exportOptionsSaveForWeb.PNG8 = false;
    exportOptionsSaveForWeb.colors = 256;
    exportOptionsSaveForWeb.transparency = true;
    exportOptionsSaveForWeb.palette = Palette.LOCALADAPTIVE;
    activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, exportOptionsSaveForWeb);
}

function SaveJPG(saveFile) {
    exportOptionsSaveForWeb = new ExportOptionsSaveForWeb();
    exportOptionsSaveForWeb.format = SaveDocumentType.JPEG;
    exportOptionsSaveForWeb.quality = prefs.fileQuality;
    activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, exportOptionsSaveForWeb);
}

function saveFolder(layer) {
    fileName = getFolder(layer, layer.name);
    var folder = new Folder(prefs.filePath + '/' + fileName);
    folder.create();
}

function getFolder(layer, layerName) {
    if (layer.parent.typename === 'LayerSet') {
        layerName = layer.parent.name + '/' + layerName;
        layerName = getFolder(layer.parent, layerName);
    }
    return layerName;
}

function countLayers(parent) {
    for (var i = 0; i < parent.layers.length; i++) {
        var layer = parent.layers[i];

        if (layer.typename === 'ArtLayer') {
            allLayers.layers.push(layer);
            parent.layers[i].visible = false;
        } else {
            allLayers.groups.push(layer);
            parent.layers[i].visible = false;
            countLayers(layer);
        }
    }

    return allLayers.layers.length;
}

function undo(doc) {
    var idslct = cTID('slct');
    var desc121 = new ActionDescriptor();
    var idnull = cTID('null');
    var ref57 = new ActionReference();
    var idSnpS = cTID('SnpS');
    ref57.putName(idSnpS, doc.name);
    desc121.putReference(idnull, ref57);
    executeAction(idslct, desc121, DialogModes.NO);

    selectAllLayers();

    var idHd = cTID('Hd  ');
    var desc295 = new ActionDescriptor();
    var idnull = cTID('null');
    var list15 = new ActionList();
    var ref84 = new ActionReference();
    var idLyr = cTID('Lyr ');
    var idOrdn = cTID('Ordn');
    var idTrgt = cTID('Trgt');
    ref84.putEnumerated(idLyr, idOrdn, idTrgt);
    list15.putReference(ref84);
    desc295.putList(idnull, list15);
    executeAction(idHd, desc295, DialogModes.NO);
}

function createProgressBar() {
    var found = new Array(50);

    var p = new Window('palette', 'Script Progress');
    p.grp = p.add('group', undefined, 'Progress Bar');
    /* p.info = p.grp.add('statictext', undefined, 'Script Progress:'); */
    p.pbar = p.grp.add('progressbar', undefined, 0, found.length);
    p.msg = p.add('statictext', undefined, '');
    p.warn = p.add('statictext', undefined, "Don't make changes to the current document while the script is running!");

    p.pbar.preferredSize = [300, 0];
    p.pbar.orientation = 'column';
    p.pbar.alignChildren = 'fill';
    p.pbar.visible = false;

    return p;
}

function showProgressBar(p, message, maxValue) {
    p.msg.text = message;
    p.pbar.maxvalue = maxValue;
    p.pbar.value = 0;

    p.center();
    p.show();
}

function updateProgressBar(p, i) {
    p.pbar.value = i + 1;
}

function cTID(s) {
    return app.charIDToTypeID(s);
}

function sTID(s) {
    return app.stringIDToTypeID(s);
}

function wrapper() {
    function showError(err) {
        alert(err + ': on line ' + err.line, 'Script Error', true);
    }

    try {
        if (app.documents.length == 0) {
            alert('Please open a document');
        } else if (prefs.version < 15) {
            alert('Sorry. Only Photoshop CC 2014 and higher');
        } else {
            app.activeDocument.suspendHistory('Blueprint Exporter', 'main()');
        }
    } catch (e) {
        // report errors unless the user cancelled
        if (e.number != 8007) {
            showError(e);
            if (documentCopy) {
                documentCopy.close(SaveOptions.DONOTSAVECHANGES);
                documentCopy = null;
            }
        }
    }
}

// instantiate Script
wrapper();
