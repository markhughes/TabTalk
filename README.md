# TabTalk
TabTalk is a simple Javascript library to communicate between tabs using localStorage, or falling back to other methods.

## Changelog of Releases 
### TabTalk v1.1.0
https://github.com/MarkehMe/TabTalk/releases/tag/v1.1.0
* Added fallback for IE 5 - IE 7
* Added fallback for some Firefox browsers (v2-v13)
* Added cleanup for old read data
* Improved options, added extraJSONParse
* Started working on extra JSON parsing, allowing passing correct data types 
* Fixed a bug where there would be no existing data and we would attempt to check the length
* Fixed a bug where we would attempt to check over data where there would be none

### TabTalk v1.0.0
https://github.com/MarkehMe/TabTalk/releases/tag/v1.0.0
* Initial Release



## Falling Back
* For IE5-IE7 we fall back to IE userData behaviors (Max 1GB storage space)
* For older FireFox versions (2+) we fall back to globalStorage (Standard localStorage limit of 5MB storage space)
* As a last resort, we fall back to cookies (less than 4KB storage space)

## TODO:
* Allow functions, and other data types in objects when they're talked 