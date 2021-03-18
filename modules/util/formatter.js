class Formatter {

    static removeXSS(o)
    {
        var walked = [];
        var stack = [{obj: o, stack: ''}];
        while(stack.length > 0)
        {
            var item = stack.pop();
            var obj = item.obj;
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] == "object") {
                      var alreadyFound = false;
                      for(var i = 0; i < walked.length; i++)
                      {
                        if (walked[i] === obj[property])
                        {
                          alreadyFound = true;
                          break;
                        }
                      }
                      if (!alreadyFound)
                      {
                        walked.push(obj[property]);
                        stack.push({obj: obj[property], stack: item.stack + '.' + property});
                      }
                    }
                    else
                    {
                        if(obj[property] != null && typeof obj[property] == "string")
                        {
                          obj[property] = obj[property].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
                        }

                        if(property == "sql")
                          obj[property] = "";
                        //console.log(item.stack + '.' + property + "=" + obj[property]);
                    }
                }
            }
        }
        return o;
    }

    static checkXSS(o)
    {
        let found = false;
        
        var walked = [];
        var stack = [{obj: o, stack: ''}];
        while(stack.length > 0)
        {
            var item = stack.pop();
            var obj = item.obj;
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] == "object") {
                      var alreadyFound = false;
                      for(var i = 0; i < walked.length; i++)
                      {
                        if (walked[i] === obj[property])
                        {
                          alreadyFound = true;
                          break;
                        }
                      }
                      if (!alreadyFound)
                      {
                        walked.push(obj[property]);
                        stack.push({obj: obj[property], stack: item.stack + '.' + property});
                      }
                    }
                    else
                    {
                        if(obj[property] != null && typeof obj[property] == "string")
                        {
                          let res = obj[property].match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi);
                          if(res != null)
                            found = true;
                          
                        }
                        //console.log(item.stack + '.' + property + "=" + obj[property]);
                    }
                }
            }
        }
        return found;
    }
    

}

module.exports = Formatter;