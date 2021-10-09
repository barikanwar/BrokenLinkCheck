const excel = require('exceljs');

function exportData(AllWebsiteResult)
    {
        let workbook = new excel.Workbook(); //creating workbook     
        
        AllWebsiteResult.map(list=>{
        const jsonWebData = JSON.parse(JSON.stringify(list.urlList));
        let workSheetName = list.website[0];
        // here we need to work from subdomain
        if(workSheetName.indexOf('www')>-1)
        {
            // from url : www.abc.com below code will return abc.com
            workSheetName = workSheetName.substring(workSheetName.indexOf('.')+1);
            // from abc.com, below code will return abc - that we can use for sheetname.
            workSheetName =   workSheetName.substring(0,workSheetName.indexOf('.'));
        }else {
            //get sheetname from  subdomain url
            workSheetName = workSheetName.substring(workSheetName.indexOf('//')+1);  
            workSheetName =   workSheetName.substring(0,workSheetName.indexOf('.'));  
        }
       
        // remove any special character 
        workSheetName =   workSheetName.replace(/[^a-zA-Z ]/g, "")
        // Limit worksheet name to 25 character long.

        workSheetName =   workSheetName.substring(0,25);
        // check whether sheet alreay created with the given name.    
        let isDuplicateWorksheetfound = workbook.worksheets.some(x=> x.name===workSheetName)
        
        if(isDuplicateWorksheetfound){
            // if worksheetname already exist then concatenate name with length, lenght will be unique in each iteration.
            workSheetName = workSheetName + workbook.worksheets.length;
        }
        let worksheet = workbook.addWorksheet(workSheetName); //creating worksheet
    //  WorkSheet Header
        worksheet.columns = [
            { header: 'URL', key: 'URL',width:60},
            { header: 'Status Code', key: 'statusCode',width:12 },
            { header: 'Status Text', key: 'statusText',width:15},
            { header: 'Content Type', key: 'contentType',width:15},
            { header: 'Link Text', key: 'linkText',width:25},
            { header: 'Referece URL', key: 'refenceUrl',width:25},
        ];
     
    // Add Array Rows
        worksheet.addRows(jsonWebData);
        })

    // Write to File
    // file name
    date=new Date()
    // date pattern : mm-dd-yyyy.hours.minute.second
 let _path ='./reports/';
 let filename= _path+'BrokenLinkReport'+'_'+date.getMonth()+'-'+date.getDate()+'-'+date.getFullYear()+'-'+date.getHours()+'.'+date.getMinutes()+'.'+date.getSeconds()+'.xlsx'
   
    workbook.xlsx.writeFile(filename)
    .then(function() {
        console.log("file saved!");
    });
    }

 //   exportData('data')
module.exports.exportData = exportData;