'use strict';
const fs=require('fs');
const path=require('path');
const yargs=require('yargs');
const getStaticJson=function(file) {
    if (!fs.existsSync(file)) {
        return ;
    }
    if (!fs.statSync(file).isFile()) {
        return ;
    }
    const text=fs.readFileSync(file,'utf8');
    var data;
    try {
        data=JSON.parse(text);
    }
    catch (e) {
        if (!(e instanceof SyntaxError)) {
            throw e;
        }
    }
    return data;
};
const checkNames=function(stdDict,curDict,text) {
    var x;
    for (x in curDict) {
        if (stdDict.hasOwnProperty(x)===false) {
            console.warn('Unknown argument name --%s in %s.',x,text);
        }
    }
};
const create=function(configPath) {
    const config0=getStaticJson(path.resolve(configPath,'default.json'));
    if (!config0) {
        console.error('Can\'t find the default argument file.');
        console.error('Check the wrapper file.');
        process.exit(1);
    }
    var config1=getStaticJson(path.resolve(process.cwd(),'arg.json'));
    if (!config1) {
        console.warn('Unable to parse \'arg.json\'.');
        config1={};
    }
    console.log('create');
    var config2=yargs['argv'];
    delete config2._;
    delete config2.$0;
    checkNames(config0,config1,'arg.json');
    checkNames(config0,config2,'command line');
    return function(name) {
        if (typeof(name)!=='string') {
            throw new Error("The argument name is not a string.");
        }
        if (config2.hasOwnProperty(name)) {
            return config2[name];
        }
        if (config1.hasOwnProperty(name)) {
            return config1[name];
        }
        if (config0.hasOwnProperty(name)) {
            return config0[name];
        }
        throw new Error('The argument --'+name+' has to be specified by command line.');
    };
};
module.exports=create;

