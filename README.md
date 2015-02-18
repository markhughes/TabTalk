# TabTalk
TabTalk is a simple Javascript library to communicate between tabs using localStorage, or falling back to other methods.

## Changelog of Releases 

### TabTalk v1.0.0
https://github.com/MarkehMe/TabTalk/releases/tag/v1.0.0
* Initial Release



## Falling Back
* For IE5-IE7 we fall back to IE userData behaviors (Max 1GB storage space)
* For older FireFox versions (2+) we fall back to globalStorage (Standard localStorage limit of 5MB storage space)
* As a last resort, we fall back to cookies (less than 4KB storage space)

## TODO:
* Allow functions, and other data types in objects when they're talked 