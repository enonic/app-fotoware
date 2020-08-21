# app-fotoware
Integration with Fotoware

## Application Configuration

```
# Required
fotoware.sites.sitename.clientId = ...
fotoware.sites.sitename.clientSecret = ...

# This is automatically generated, but can be overridden:
#fotoware.sites.sitename.url = https://sitename.fotoware.cloud

# These are the defaults, but they can be overridden:
#fotoware.sites.sitename.project = default
#fotoware.sites.sitename.path = FotoWare
#fotoware.sites.sitename.rendition = Original File
#fotoware.sites.sitename.query = fn:*.gif|fn:*.jpg|fn:*.jpeg|fn:*.png|fn:*.svg

# Only allow webhooks from these ips:
#fotoware.sites.sitename.remoteAddresses.'127.0.0.1'
#fotoware.sites.sitename.remoteAddresses.'127.0.0.2'

# You may configure multiple FotoWare sites:
fotoware.sites.anothersitename.clientId = ...
fotoware.sites.anothersitename.clientSecret = ...
fotoware.sites.anothersitename.project = MaybeAnotherProject
fotoware.sites.anothersitename.path = AtLeastADifferentPath

# Or you can sync different queries from the same FotoWare site:

fotoware.sites.sitenameDocuments.clientId = ...
fotoware.sites.sitenameDocuments.clientSecret = ...
# In this example it's important to set url, because sitenameDocuments is not part of the actual url
fotoware.sites.sitenameDocuments.url = https://sitename.fotoware.cloud
fotoware.sites.sitenameDocuments.path = FotoWare Documents
fotoware.sites.sitenameDocuments.path = fn:*.pdf

fotoware.sites.sitenameVideos.clientId = ...
fotoware.sites.sitenameVideos.clientSecret = ...
# In this example it's important to set url, because sitenameVideos is not part of the actual url
fotoware.sites.sitenameVideos.url = https://sitename.fotoware.cloud
fotoware.sites.sitenameVideos.path = FotoWare Videos
fotoware.sites.sitenameVideos.path = fn:*.mov|fn:*.mp4
```
