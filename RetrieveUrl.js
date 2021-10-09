const exporttoexcel = require('./exporttoexcel');
const websiteToScan= require('./websitestoscan')
const cheerio = require('cheerio');
const axios = require('axios');

let listRepoponse=[]
let urlScrappedList = []
var baseurl='';
let validUrls='http'; 
let websiteCount=0;
let isNewRequest=true;
// initial start
start = async (url)=>{
    // Start crawler with the url
   return new Promise(async resolve=>{

    urlScrappedList.push({URL:url,linkText:'/'})
        while(websiteCount !== urlScrappedList.length)
        {
          const _urls = await  getSetgo()
        }
        resolve(urlScrappedList)
    })
}


getSetgo = async() => {
    return new Promise(async resovle=>{
    const _url =  urlScrappedList[websiteCount].URL
    const _linkText = urlScrappedList[websiteCount].linkText;
    const refUrl = urlScrappedList[websiteCount].refereceUrl;
    // Scan only when url is valid.
    if(isUrlValidForScan(_url))
    {
    await fetchData(_url,_linkText,refUrl)
    }
    websiteCount++;
    resovle(websiteCount)
})
   // getSetgo()
}

 fetchData = async(url, linkText, refUrl) => {
    let resType='';
    let res;
    let _method='get';
    let _isExternalDomain =isNewRequest==true?false : IsExternalDomain(url);

     if((extensionForHeadRequestOnly.some(e=>url.indexOf(e)!==-1)|| _isExternalDomain==true))
     {  // This is for pdf, jpg, gif, or any other font type .
        // If requested url is  apart from the html, js and css change the request type to head instead of get. 
        resType = 'arraybuffer'  
        _method = 'head'
     } 
        
        console.log('Processing URL -: ',url)
       
        console.log('Method :-',_method)
        

        res = await axios({ 
            method: _method,
            url: url,
            validateStatus: false, 
            responseType: resType,
            timeout:6000,
            headers: { 'User-Agent': 'Axios - console app' }
        }).catch((error)=>console.log('error occured'))
        
      
        if(isNewRequest)
        {
            baseurl=BaseURL(res);
            isNewRequest=false;
        }
        
        
        // One time only get the base url.
        
    // list all response status code, content type, hostname
        createList(res,url,linkText,refUrl)
        
    // res is undefined meaning there is any error processing url so go back and process another url.   
    if(res===undefined || res.headers['content-type']===undefined) return;
    // Read conent of only html pages.
    if(!_isExternalDomain)
        {  
            if(res.headers['content-type'].indexOf('text/css')!=-1 || res.headers['content-type'].indexOf('text/html')!=-1 && res.status===200)
            {
                // Do not read or scrap external domain data
            
               // if(IsExternalDomain(url)===false)
              //  {
                    $ = cheerio.load(res.data);
                    if (res.headers['content-type'].indexOf('text/css')!=-1){
                        // Extract data from css.
                        await extractImage($.text(),url);
                    }
                else{
                    const href= $('href')
                        // Extract data from web page.
                    const data = await scrapWebPage($,url);
                }
              //  }
            }
        }
    
}

// Scrap all href from the returned page.
scrapWebPage = async ($,url) => {
    console.log('Web scrapping in progress');
    
    $('div').each(function (i, e) {
        //  console.log('Text :', $(this).css('title'),'href - ',$(this).attr('href'))
          urlScrappedList.push({URL:createCompleteUrl($(this).attr('href')),linkText: $(this).text(),refereceUrl:url})
         });
    $('a[href]').each(function (i, e) {
       urlScrappedList.push({URL:createCompleteUrl($(this).attr('href'),url),linkText: $(this).text(),refereceUrl:url})
      });
      // Grab css files
      $('link[href]').each(function (i, e) {
        urlScrappedList.push({URL:createCompleteUrl($(this).attr('href')),linkText: $(this).text(),refereceUrl:url})
      });
      // Grab javascript files
      $('script[src]').each(function (i, e) {
        urlScrappedList.push({URL:createCompleteUrl($(this).attr('src')),linkText: $(this).text(),refereceUrl:url})
      });
      // Grab images
      $('img[src]').each(function (i, e) {
      //  console.log('$(this).attr',$(this).attr('src'))
        urlScrappedList.push({URL:createCompleteUrl($(this).attr('src')),linkText: $(this).attr('alt'),refereceUrl:url})
      });

      $('iframe[src]').each(function (i, e) {
        //  console.log('$(this).attr',$(this).attr('src'))
          urlScrappedList.push({URL:createCompleteUrl($(this).attr('src')),linkText: '',refereceUrl:url})
        });
  

        $('source[src]').each(function (i, e) {
            //  console.log('$(this).attr',$(this).attr('src'))
              urlScrappedList.push({URL:createCompleteUrl($(this).attr('src')),linkText: '',refereceUrl:url})
        });

      // Remove duplicate record from array.
      urlScrappedList = removeDuplicateRecord(urlScrappedList,'URL')
     
}

// Merge baseurl and related url.
createCompleteUrl= (uri,currentUrl) => {
    let _url=uri;
    if(uri!==undefined){
        if (uri.startsWith('//'))
        {
                _url= 'http:'+uri
        }else if(_url.startsWith('?'))
        {
            if(currentUrl.indexOf('?')!==-1)
            {
                // If the url already has querystring like abc.com?name=hello then it is better to 
                // get the domain only then appedn the url with
               let splittedUrl = currentUrl.split('?')
                if(splittedUrl.length>1)
                {
                    _url = splittedUrl[0]+uri;   
                }
            }
            else{
                _url=currentUrl+uri
            }
                
        }

       else if(uri.startsWith('/'))
        {
        _url = baseurl + uri
       }
        //else if (!_url.startsWith('http'))
        //{
     //       _url = baseurl + uri
        //}

       return filterUrl(_url)
}
}

// list all response status code, content type, hostname
createList = (res,url,linkText,refUrl) => { 
    if(res!==undefined)
    {
        //Create list of redirected url
        if(res.request._redirectable._redirectCount!=0 && res.status!==404)
        {
            urlScrappedList.push({URL:createCompleteUrl(res.request.res.responseUrl),linkText: 'redirected',refereceUrl:url})
        }
    console.log('Response status :- ',res.status)
    console.log('Creating List')
    listRepoponse.push({
        URL:url, 
        statusCode:res.status, 
        statusText:res.statusText,
        contentType:res.headers['content-type'],
        linkText:linkText,
        refenceUrl:refUrl })
    }
    else {
        // res is undefined meaning there is any error processing url.
        console.log('Creating error List')
        listRepoponse.push({
            URL:url, 
            statusCode:00, 
            statusText:'error occured while processing url',
            contentType:'',
            linkText:linkText,
            refenceUrl:refUrl })
    }
    console.log('website scanned till now -:',listRepoponse.length)
}
// ==========helper functions start here================
isUrlValidForScan = (url) => {
    if(url!==undefined){
        return url.indexOf(validUrls) !== -1
    }
    return false;
}

IsExternalDomain = (url) => {
    if(url!==undefined){
            return url.indexOf(baseurl) == -1
    }
}

function removeDuplicateRecord(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
}

function BaseURL(res) {
    if(res===undefined) return;
    return `${res.request.protocol}//${res.request.host}`
}

function isArrayEmpty(arrayData)
{
    return arrayData.length===0
}

function filterUrl(_url){
    return _url.replace(/"/g,'').replace(/\\/g,'').replace(/'/g,'').replace(/\n/g,'').replace(/ /g,'');
}

let extensionForHeadRequestOnly = [
    '.pdf','.png','.jpg','.ico','.gif','.woff',
'.otf','.ttf','.eot','.svg','.mp4','.avi','.wmv','.mov','.mkv','.flv','webm','m4v'
]

// ===============helper function ends here=====================


//====================url extract from css, code starts from here =====================
let cssurl=[]
let _path;

async function extractImage(css,cssUrl) {
    if(css.indexOf('url(') != -1)
    {
		//debugger;
        let extractedcss = css.substring(css.indexOf('url(')+4)
        let imgPath=extractedcss.substring(0,extractedcss.indexOf(')'));
        //  console.log('url :-',createAbsolutePath(imgPath,cssUrl));
        css = extractedcss;

        urlScrappedList.push({URL:createAbsolutePath(imgPath,cssUrl),linkText:'',refereceUrl:cssUrl})
        css = css.substring(css.indexOf(')')+1);
         await  extractImage(css,cssUrl)
          // Remove duplicate record from array.

    }
    urlScrappedList = removeDuplicateRecord(urlScrappedList,'URL')
}


// path  =  ../../../../misc/icons/787878/twistie-down.svg

function createAbsolutePath(imgPath,cssFileUrl) {
	//if path like ../misc/icons/787878/twistie-down.svg
 /*   var fullUrl ;
    // Filter url remove " double quotes from the url
    imgPath=filterUrl(imgPath);

    if(imgPath.startsWith('/')){
        return baseurl+imgPath
    }
    let splitedpath = imgPath.split('../');
	//if path like ./misc/icons/787878/twistie-down.svg
	splitedpath = imgPath.split('./');
    cssFileUrl = cssFileUrl.substring(0,cssFileUrl.lastIndexOf('/'))
     backfolder(cssFileUrl,splitedpath.length-1);
     var fullUrl = _path + '/' +splitedpath[splitedpath.length-1];
     fullUrl = fullUrl.replace("'","").replace("\"","")
    return fullUrl
*/


//if(imgPath.startsWith('http')) return imgPath;

if(imgPath.startsWith('../')){
cssFileUrl=cssFileUrl.substring(0,cssFileUrl.lastIndexOf('/'))
return makeUrl(filterUrl(cssFileUrl),filterUrl(imgPath)).replace("'","").replace("\"","").replace('"','')
}else
{
    return filterUrl(baseurl)+'/'+filterUrl(imgPath)
}

}

function makeUrl(_cssFileUrl,_imgPath)
{
    let _url=_cssFileUrl+_imgPath;

    // If slash needs to add or not between the two urls.
    if(_cssFileUrl.lastIndexOf('/')!=_cssFileUrl.length-1 && _imgPath.indexOf('/')>0)
    {
        _url=_cssFileUrl+'/'+_imgPath;
    }
 //   let _url=_cssFileUrl+_imgPath;

    if(_url.indexOf('../')!==-1)
    {
        // If image startwith / meaning this is already in base path so merge with only baseurl.
        if(_imgPath.startsWith('/'))
        {
            _url = baseurl+_imgPath;
        }
      
        _url = _url.split('/')
        let backFolderCount = _url.filter(e=>e.indexOf('..')!=-1)
        let firstcut = _url.slice(0,_url.indexOf('..')-backFolderCount.length)
        let secondcut = _url.slice(_url.lastIndexOf('..')+1,_url.length)
        _url=[...firstcut,...secondcut]
        _url=_url.join().replace(/,/g,'/')
       
    }else if(_imgPath.startsWith('/'))
    {
        _url = baseurl+_imgPath;
        // Check for ./ url
        if(_url.indexOf('./')!==-1)
        {
         _url = _url.split('/') 
         let firstcut = _url.slice(0,_url.indexOf('.')-1)
         let secondcut = _url.slice(_url.lastIndexOf('.')+1,_url.length)
         _url=[...firstcut,...secondcut]
         _url=_url.join().replace(/,/g,'/')
        }
    }
    return _url;
}



// below go back each directory as the path required.
//http://jynvirtualbooth21q1build.otsuka.acsitefactory.com/sites/g/files/qhldwo2991/themes/site/theme_virtual_booth/css
//http://jynvirtualbooth21q1build.otsuka.acsitefactory.com/sites/g/files/qhldwo2991/themes/site/theme_virtual_booth
//http://jynvirtualbooth21q1build.otsuka.acsitefactory.com/sites/g/files/qhldwo2991/themes/site
function backfolder(url,backtill) {
	if(backtill===0)
	 {
		_path = url
		return;
	 }
    url = url.substring(0,url.lastIndexOf('/'))
    backtill--
	backfolder(url,backtill)
}

// =====================css url extraction ends here===================================

//let arr=['//assets.adobedtm.com/3f0d2e2dbd42/01acf52b54d9/launch-3015fcae30df.min.js'
    //'http://mycitehcc21q2rw2sms.otsuka.acsitefactory.com/'
//'http://breathtekhcp20q4schemaupdate.otsuka.acsitefactory.com/',
//'http://experts20q3php73.otsuka.acsitefactory.com/',
//'http://corrpcomms21q2myciteorphan.otsuka.acsitefactory.com/'
//]

// Starting point.
let AllWebsiteResult=[];
const starting=async()=>{
    for(let i=0;i<websiteToScan.websites.length;i++)
    {   const record = await start(websiteToScan.websites[i])
        // If there is data in the list then only add in the array.
        if(!isArrayEmpty(listRepoponse))
        {
        AllWebsiteResult.push({
                            website:[websiteToScan.websites[i]],
                            urlList: listRepoponse
                              })
        
        listRepoponse=[];
        urlScrappedList=[];
        websiteCount=0;
        isNewRequest=true;
        }
    }
// If there is no data to in array then no need to import empty array in excel.
    if(!isArrayEmpty(AllWebsiteResult))
    {
       exporttoexcel.exportData(AllWebsiteResult);
    }else{
        console.log('No data to import in excel.')
    }
}
starting()
