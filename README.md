# app-fotoware
Integration with Fotoware

## Manual tests

1. Setup configuration in com.enonic.app.fotoware.cfg

### Initial sync from FotoWare to Enonic XP

1. Login to Enonic XP Admin
2. Open the Enonic XP FotoWare Integration Application and click the [Refresh] button
3. Inspect the created content using Content Studio

### Move and rename in Enonic XP

1. Rename an image
2. Create a folder within the sync folder and move the image there
3. Open the Enonic XP FotoWare Integration Application and click the [Refresh] button
4. Inspect the content using Content Studio

### Property test

#### Overwrite
1. Edit com.enonic.app.fotoware.cfg and set all properties to overwrite
2. Open Enonic XP Content Studio
3. Edit a synced image and change displayName, artist, copyright, tags and description
4. Open the Enonic XP FotoWare Integration Application and click the [Refresh] button
5. Inspect the content using Content Studio and notice all your changes are gone

#### ifChanged

1. Edit com.enonic.app.fotoware.cfg and set all properties to ifChanged
2. In Enonic XP Content Studio, edit a synced image and change displayName, artist, copyright, tags and description
3. Open the Enonic XP FotoWare Integration Application and click the [Refresh] button
4. Inspect the content using Content Studio and notice all your changes are unchanged
5. In FotoWare edit an image and change title, author, copyright, keywords and description.
6. Open the Enonic XP FotoWare Integration Application and click the [Refresh] button
7. Inspect the content using Content Studio and notice all your changes are overwritten

#### onCreate

1. Edit com.enonic.app.fotoware.cfg and set all properties to onCreate
2. In FotoWare edit an image and change title, author, copyright, keywords and description.
3. Open the Enonic XP FotoWare Integration Application and click the [Refresh] button
4. Inspect the content using Content Studio and notice what you wrote in FotoWare has not been synced to Enonic XP.

### Duplicate in Enonic XP

1. Duplicate an image within the sync folder
2. Open the Enonic XP FotoWare Integration Application
3. Click the Refresh button
4. Notice the ERROR in the log.

### Rename in FotoWare

1. Edit and rename an image in FotoWare
2. Open the Enonic XP FotoWare Integration Application
3. Click the Refresh button
4. Inspect the content using Content Studio
5. Notice a duplication has occurred

## Compatibility

| App version | XP version |
| ----------- | ---------- |
| 1.0.0 | 7.5.0 |

## Changelog

### 1.0.1-SNAPSHOT

* Build system upgrades:
  * Node 14.17.0

### 1.0.0

* Keep original FotoWare filename in x-data, to allow rename in Enonic XP
* Set default archiveName to 5000-All-files
* Require Enonic 7.5.0
* Make assets local:
  * Babel standalone
  * Google fonts
  * Material-UI
  * Moment
  * React and React DOM
* Build system upgrades:
  * Node 14.16.0
  * Babel modules 7.13.14
  * Core-js 3.10.0
  * Webpack 5.30.0
