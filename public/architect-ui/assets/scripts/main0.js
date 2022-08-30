
var done = false;
$(".fa-calendar-alt").on('click', function (){

    setTimeout(function (){
        $("ul[data-view='days']").on('click', function (){
            $(".datepicker-dropdown").addClass("datepicker-hide");
            setTimeout(function (){
                $(".fa-calendar-alt").trigger('click')

            },10)
            
        })
    },10)
    


})
