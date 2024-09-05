

/*** DATE PICKER ***/

N.$datepicker = function(pickerObj, pickerOptions) {
    //make datetime format conform to jquery-ui format
    //http://docs.jquery.com/UI/Datepicker/formatDate
    //http://trentrichardson.com/examples/timepicker/
    var mode='';
    if(pickerOptions!==undefined){
        if(pickerOptions.timeFormat!==undefined){
            mode='time';
            var timeFormat;
            if(pickerOptions.timeFormat.match(/M{2}/)){
                timeFormat = pickerOptions.timeFormat.replace("MM", "mm")
                pickerOptions.timeFormat = timeFormat;
            }else if(pickerOptions.timeFormat.match(/M{1}/)){
                timeFormat = pickerOptions.timeFormat.replace("M", "m")
                pickerOptions.timeFormat = timeFormat;
            }

            if(pickerOptions.timeFormat.match(/t/i)){
                pickerOptions.ampm=true;
            }
        }
        if(pickerOptions.dateFormat!=undefined){
            mode+='date';
            var dateFormat;
            if(pickerOptions.dateFormat.match(/y{4}/)){
                dateFormat = pickerOptions.dateFormat.replace("yyyy", "yy");
                pickerOptions.dateFormat = dateFormat;
            }else if(pickerOptions.dateFormat.match(/y{2}/)){
                dateFormat = pickerOptions.dateFormat.replace("yy", "y");
                pickerOptions.dateFormat = dateFormat;
            }
        }
    }
    if(mode === ''){
        jQuery(pickerObj).datepicker(pickerOptions);
    }else{
        if(mode === 'timedate'){
            jQuery(pickerObj).datetimepicker(pickerOptions);
        }else if(mode === 'time'){
            jQuery(pickerObj).timepicker(pickerOptions);
        }else{
            jQuery(pickerObj).datepicker(pickerOptions);
        }
    }
}

N.$date_range = function(from, to, changeMonthOption, changeYearOption, numberOfMonthsOption, formatOption) {
    // initialize date picker options
    pickerOptions = {};
    pickerOptions.changeMonth = changeMonthOption;
    pickerOptions.changeYear = changeYearOption;
    pickerOptions.numberOfMonths = numberOfMonthsOption;
    pickerOptions.dateFormat = formatOption;

    // set from, to picker options to the above options
    fromPickerOptions = jQuery.extend(true, {}, pickerOptions);
    toPickerOptions = jQuery.extend(true, {}, pickerOptions);

    // when select date on from date picker, limit date in to date picker
    fromPickerOptions.onClose = function( selectedDate ) {
        $( "#"+to ).datepicker( "option", "minDate", selectedDate );
    };

    // when select date on to date picker, limit date in from date picker
    toPickerOptions.onClose = function( selectedDate ) {
        $( "#"+from ).datepicker( "option", "maxDate", selectedDate );
    };

    // initialize from, to date picker
    Nitrogen.$datepicker(obj(from), fromPickerOptions);
    Nitrogen.$datepicker(obj(to), toPickerOptions);
};
