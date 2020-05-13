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