# Photoshop Exporter

## General Information

Exports images (png's and jpg's) from a multi-layered Adobe Photoshop document into the desired location, in the same structure as in the Photoshop document.

## Requirements to run

Adobe Photoshop > CS2 and Exporter_VXX.jsx are required for this script to run

## Loading the scipt

### Load the script one of two ways by:

-   In Windows: Right click on the file > open with... > Adobe Photoshop;
-   In Adobe Photoshop: File > Scripts > Browse... and Click the script within the explorer dialog box

## Options

-   Adding `[pos]` to a layer name will only output the coordinates (if chosen in the dialog)
-   Adding `[img]` to a layer name will only output the image (no coordinates if they have been turned on in the dialog)
-   Adding `[na]` to a layer or a group name will prevent it from being output at all. (to be used for supporting layers)

## Dialog Checkboxes

-   `Trim`, trims each layer to their repsective size and outputs them at that size
-   `Export Coordinates files for V2`, exports individual files next to each file, named the same as the layer, called layerName.atlas.json and layerName.coords.json each containing specific details about the file for use with the Blueprint Gaming V2 framework
-   `Export Manifest file for V3`, exports one manifest file in `~/manifest/static_manifest.json` that will have the name, location, x and y coordinates for each layer/file
