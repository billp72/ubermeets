export function dateToAge(dob){
    if(dob){
        const dateArr = dob.split("/");//month, day, year
        const dateObj = new Date(
                            parseInt(dateArr[2],10),
                            parseInt(dateArr[0],10),
                            parseInt(dateArr[1],10)
                        );//year, month, day
        const diff_ms = Date.now() - dateObj.getTime();
        const age_dt =  new Date(diff_ms); 
  
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    }
}

export function validURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  export function checkDate(str) {
    let input = str,
  		  expr = new RegExp(/^\d+$/);

    if(expr.test(input)){
      if(str.length > 8 || str.length < 6){
        return {msg: 'Correct format is numerical month, day and full year'}
      } 
      if(input.length == 8){
        input = input.substr(0,2) + '/' + input.substr(2, 2) + '/' + input.substr(4, 4)
      }
      if(input.length == 6){
        input = input.substr(0,1) + '/' + input.substr(1, 1) + '/' + input.substr(2, 4)
      }
    }
    
    let values = input.split(/\D/g).map(function(v) {//parse string into array. remove delimiter
        return v.replace(/\D/g, '')
    });

    if (values[0]) values[0] = checkValue(values[0], 12);
    if (values[1]) values[1] = checkValue(values[1], 31);
    
    let output = values.map(function(v, i) { //add backslash delimiter
        return v.length == 2 && i < 2 ? v + '/' : v;
    });

    if(output.length == 3 &&
      output[0].indexOf('/') != -1 &&
      output[1].indexOf('/') != -1 &&
      values[2].length == 4){
       return output.join('').substr(0, 14);
    }else{
       return {msg: 'Correct format is numerical month, day and full year'}
    }
}

function checkValue(str, max) {

  if (str.charAt(0) !== '0' || str == '00') {
     let num = parseInt(str);
     if (isNaN(num) || num <= 0 || num > max) num = 1;
     str = num > parseInt(max.toString().charAt(0)) &&
     num.toString().length == 0 ? '0' + num : num.toString();
  }
  return str;
}