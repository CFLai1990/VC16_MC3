String.prototype.visualSize = function(d)
{
	var ruler = $("#ruler");
	ruler.css("font-size",d+'px').text(this);
	return [ruler[0].offsetWidth, ruler[0].offsetHeight];
}