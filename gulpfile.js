const { clean, restore, build, test, pack, publish, run } = require('gulp-dotnet-cli');
const gulp = require('gulp');
const fs   = require('fs');
const shell = require('gulp-shell');
const zip = require('gulp-zip');
var path = require('path');
var gulpSequence = require('gulp-sequence');
// var promise = require("gulp-promise");

var releaseName= ''; 
//var releasePath = 'D:/Training/ASP/Release/';
var currentDir= path.join(__dirname, '../../');
var releasePath = currentDir.replace(/\\/g, "/"); //+ 'Release/';

  var $utility = (($this)=>{
     return{
         getNowTimeStamp(){
            return Math.round(new Date().getTime()/1000);
         },
         copyFolder(from,to){
            return gulp.src([from]).pipe(gulp.dest(to));
         },
         logger(message){
             console.log(message);
             return gulp;
         }, bumpRelease(){
            if($this.releaseName !=''){
                $this.releaseName =$utility.getNowTimeStamp();
                releaseName = $this.releaseName;
            }
            console.log('THE RELEASE NAME == '+ $this.releaseName);
        }
     }

  })(this);
   
  var $test =  (($this) => {
        function identity(query, logQuery) {
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Identity/Test/BBK.Module.Identity.Test.csproj');
            return  gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("Identity Test Starting"));
        };
        function vehicle(query, logQuery){
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Vehicle/Test/BBK.Module.Vehicle.Test.csproj');
            return  gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("Vehicle Test Starting"));
        };
        function sk(query, logQuery){
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/SharedKernel/Test/BBK.SharedKernel.Test.csproj');
            return  gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("SK Test Starting"));
        };
        function schedule(query, logQuery){
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Schedule/Test/BBK.Module.Schedule.Test.csproj');
            return gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query}))
            .pipe($utility.logger("Schedule Test Starting"));;
        };
        function route(query, logQuery) {
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Route/Test/BBK.Module.Route.Test.csproj');
            return gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("Route Test Starting"));;
        };
        function automationSchedule(query, logQuery){
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Schedule/Test/BBK.Module.Schedule.Test.csproj');
            return gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("Schedule Automations Starting"));;
        };
        function automationRoute(query, logQuery){
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Route/Test/BBK.Module.Route.Test.csproj');
            return gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("Route Automations Starting"));;
        };
        function automationVehicle(query, logQuery){
            var pathToTest = path.join(__dirname, '../Code/src/Libraries/Modules/Vehicle/Test/BBK.Module.Vehicle.Test.csproj');
            return gulp.src(pathToTest).pipe(test({ framework: 'netcoreapp2.0', logger: logQuery, filter: query }))
            .pipe($utility.logger("Vehicle Automations Starting"));;
        }
        return {
            smokeUnitTestIdentity:()=>{
                console.log("Start Smoke Testing: Identity");
                identity('', '"xunit;LogFilePath=identity_test_result.xml"');
                return gulp;
            },
            smokeUnitTestSk:()=>{
                console.log("Start Smoke Testing: Schedule");
                sk('', '"xunit;LogFilePath=shared_kernel_test_result.xml"');
                return gulp;
            },
            smokeUnitTestSchedule:()=>{
                console.log("Start Smoke Testing: Schedule");
                schedule('AutomationTest!=All', '"xunit;LogFilePath=schedule_test_result.xml"');
                return gulp;
            },
            smokeUnitTestRoute:()=>{
                console.log("Start Smoke Testing: Route");
                route('AutomationTest!=All', '"xunit;LogFilePath=route_test_result.xml"');
                return gulp;
            },
            smokeUnitTestVehicle:()=>{
                console.log("Start Smoke Testing: Vehicle");
                vehicle('AutomationTest!=All', '"xunit;LogFilePath=vehicle_test_result.xml"');
                return gulp;
            },
            supportingMethod:()=>{
                return gulp;
            },
            regressionTest:()=>{
                automationSchedule('AutomationTest=All', '"xunit;LogFilePath=schedule_test_result.xml"');
                automationRoute('AutomationTest=All', '"xunit;LogFilePath=route_test_result.xml"');
                automationVehicle('AutomationTest=All', '"xunit;LogFilePath=vehicle_test_result.xml"');
                return gulp;
            },
        }

    })(this);


    var $dotnet = (($this)=>{
        var apiPath = path.join(__dirname, '../api/'); 
        apiPath = apiPath.replace(/\\/g, "/");
        
        function build(){
            return  gulp.src('../Code/src/Presentation/Api/Api/BBK.Web.Host.csproj', { read: false })
            .pipe(build());	
        };
        function createDir(path,folderName){
            var fpath = path+folderName; 
            fs.mkdirSync(fpath);
            fs.mkdirSync(fpath+'/api');
            fpath += '/api';
            console.log('FOLDER WAS CREATED == '+fpath);
            return fpath;
        };
        function siteUpApi()
        {
            process.chdir(apiPath);
            console.log('Path to API artifact folder:' + apiPath);
            return gulp.src(apiPath)
            .pipe(shell(['dotnet BBK.Web.Host.dll'])); 
        };
        return {
            publish(){
                $utility.bumpRelease();
                var pathToCreate  = createDir(releasePath,releaseName);
                console.log('path = '+ pathToCreate);
                var pathToApi = path.join(__dirname, '../Code/src/Presentation/Api/Api/BBK.Web.Host.csproj');
                return gulp.src(pathToApi)
                .pipe(publish({ output: pathToCreate}));
            },
            siteUp(){
                return siteUpApi();
            }

        };
    })(this);

    $gulpUtilities = (($this) =>{
        function createDir(path,folderName){
            var fpath = path+folderName; 
            // fs.mkdirSync(fpath);
            fs.mkdirSync(fpath+'/Automation');
            fpath += '/Automation';
            console.log('FOLDER FOR AUTOMATION WAS CREATED == '+fpath);
            return fpath;
        }
        function createMigrationFile(){
            var fileContent = "Add migrations here";
            var filepath = releasePath+releaseName+'/Migration.json'; 
            fs.writeFile(filepath, fileContent, (err) => {
                if (err) throw err;
                console.log("The file was succesfully saved! : "+ filepath);
            }); 
        }
        function createCmdFile(){
            var fileContent = "cd Automation \n npm install \n gulp siteup";
            var filepath = releasePath+releaseName+'/build.cmd'; 
            fs.appendFile(filepath, fileContent, (err) => {
                if (err) throw err;
                console.log("The file was succesfully saved! : "+ filepath);
            }); 
        }
        function copyAutomationFolder(){
            var curDir = __dirname.replace(/\\/g, "/");
            var files = [
                curDir+'/*.js',
                curDir+'/*.json'
              ];
            var path  = createDir(releasePath,releaseName);
            return gulp.src(files)
            .pipe(gulp.dest(path));
        }
        function zipFolder()
        {
            var pathToZipSrc =releasePath+releaseName+'/**';
            console.log('PATH TO ZIP SRC: '+pathToZipSrc);
            var zipName = releaseName+'.zip';
            console.log('ZIP Name: '+zipName);
            return gulp.src(pathToZipSrc)
            .pipe(zip(zipName))
            .pipe(gulp.dest(releasePath));
        }
        return {
            moveAutomationFolder(){
                createMigrationFile();
                createCmdFile();
                return copyAutomationFolder();
            },
            zipArtifacts(){
                return zipFolder();
            }
        }
    })(this);


    var $ngAdmin = (($this)=>{
        var pathToAdmin = path.join(__dirname, '../Code/src/Presentation/Web/BbkAdmin'); 
        pathToAdmin = pathToAdmin.replace(/\\/g, "/");
        function ngBuildProd(){
            process.chdir(pathToAdmin);
            console.log('Path to Admin folder:' + pathToAdmin);
            return gulp.src(pathToAdmin)
            .pipe(shell(['npm install']))            
            .pipe(shell(['ng build --prod']));            
        }
        function createDir(path,folderName){
            var fpath = path+folderName; 
            // fs.mkdirSync(fpath);
            fs.mkdirSync(fpath+'/admin');
            fpath += '/admin';
            console.log('FOLDER WAS CREATED == '+fpath);
            return fpath;
        };
        function copy(){
            var files = [
                'dist/**/*.*'
              ];
            var path  = createDir(releasePath,releaseName);
            return gulp.src(files)
            .pipe(gulp.dest(path));
            //return $utility.copyFolder('D:/Training/ASP/busbooking/Code/src/Presentation/Web/BbkAdmin/dist/*',releasePath.concat($this.releaseName,'/Admin'));
            //return $utility.copyFolder('D:/Training/ASP/busbooking/Code/src/Presentation/Web/BbkAdmin/dist/*','D:/Training/ASP/Release/Admin');
        };
        function siteUpAdmin(){
            var adminPath = path.join(__dirname, '../admin/'); 
            adminPath = adminPath.replace(/\\/g, "/");
            process.chdir(adminPath);
            console.log('Path to API artifact folder:' + adminPath);
            return gulp.src(adminPath)
            .pipe(shell(['http-server'])); 
        }
        return {
            publish(){
                // $utility.bumpRelease();
                ngBuildProd();
                return copy();
            },
            siteUp(){
                return siteUpAdmin();
            }
        }
    })(this);
 

    

//gulp.task('start', gulp.series($test.smokeUnitTestIdentity, $test.smokeUnitTestSk));
// gulp.task('start', gulpSequence($test.smokeUnitTestIdentity, $test.smokeUnitTestSk));

gulp.task('start', function a(cb) {
    gulpSequence($test.supportingMethod, $test.smokeUnitTestSk);
    gulpSequence($test.supportingMethod, $test.smokeUnitTestIdentity);
    gulpSequence($test.supportingMethod, $test.smokeUnitTestSchedule);
    gulpSequence($test.supportingMethod, $test.smokeUnitTestRoute);
    gulpSequence($test.supportingMethod, $test.smokeUnitTestVehicle);
    gulpSequence($test.supportingMethod, $dotnet.publish);
    gulpSequence($test.supportingMethod, $ngAdmin.publish);
    gulpSequence($test.supportingMethod, $gulpUtilities.moveAutomationFolder);
    gulpSequence($test.supportingMethod, $gulpUtilities.zipArtifacts);
    cb();
  });

  gulp.task('siteup', function a(cb){
      gulpSequence($test.supportingMethod, $dotnet.siteUp);
      gulpSequence($test.supportingMethod, $ngAdmin.siteUp);
      cb();
  });











  