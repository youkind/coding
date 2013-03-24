/*
 *调用示例
<script>
    function LoadList(page){
        var param = {'_page':page}
        $.get('/kohana/index.php/Edit/_list', param, function(data){
            data = $.parseJSON(data);
            data = data['data'];
            
            //列信息 attr: index text type extra
            //行数据 [{index:data, index:data},{...}]
            //表格选项 attr: width
            
            //传入table容器 列信息 行数据
            var table_option={width:'80%'};
            u_table.fillTable($("#t_cont"), data['cols'], data['rows'], table_option);
            
            //分页选项包括 每页大小 当前页 总条数 翻页事件处理函数
            var page_option = {
                'page_size':data['page_size'],
                'page':data['page'],
                'total':data['total'],
                'page_method':LoadList
            };
            
            //传入pagination容器 分页选项
            u_page.fillPage($("#t_page"), page_option);
        });
    }
    
    $(function(){
        var page = 1;
        LoadList(page);
    });
</script>

*/
var u_table={
    cols:[],//attr: index text type extra
    option:{}, //width
    event:[],
    
    init:function(cols, option){
        u_table.clearEvent();
        if(!option) option = {};
        u_table.cols = cols;
        u_table.option = option;
    },
    
    getWidth:function(){
        if(!u_table.option['width']){
            return "80%";
        }
        return option['width'];
    },
    
    getTable:function(cols,data, option){
        u_table.init(cols,option);
        var width = u_table.getWidth();
        var ret='<table class="table table-condensed" styple="width:'+width+'">';
        ret += u_table.getHead();
        ret += u_table.getBody(data);
        ret += "</table>\n";
        return ret;
    },
    
    getHead:function(){
        var c_width = 0;
        for(c in u_table.cols){
            if(!u_table.cols[c]['width'])
                c_width += 1;
            else
                c_width += u_table.cols[c]['width'];
        }
        var width = u_table.getWidth();
        var num_reg = /[0-9]+/g;
        var tmp = width.match(num_reg);
        var width_num = tmp[0];
        var width_unit = width.replace(num_reg,'');
        
        var ret = '<thead><tr>';
        for(c in u_table.cols){
            var col = u_table.cols[c];
            var th_width = col['width'] ? col['width'] : 1;
            var th_title = '';
            var th_index = col['index'];
            if(col['type'] == 'text'||!col['type'] || col['type'] == 'enum'){
                if(typeof col.text != 'undefined'){
                    th_title = col.text;
                }
                ret += "<th style='width:"+Math.round(width_num*th_width/c_width)+width_unit+"'>"+th_title+"</th>";
            }
            else if(col['type'] == 'checkbox'){
                th_title = "<input class='_all_"+th_index+"' type='checkbox'/>";
                ret += "<th style='width:"+Math.round(width_num*th_width/c_width)+width_unit+"'>"+th_title+"</th>";
                u_table.event.push({
                    type:'checkbox',
                    extra:th_index
                });
            }
        }
        ret += '</tr></thread>';
        return ret;
    },
    
    getBody:function(data){
        var ret = "<tbody>";
        for(d in data){
            ret += u_table.formatRow(data[d]);
        }
        ret += "</tbody>";
        return ret;
    },
    
    formatEnum:function(row, col){
        var v=col.extra[row[col.index]];
        return v;
    },
    
    formatCheckbox:function(row, col){
        var v=row[col.extra];
        return "<input class='"+col.index+"' type='checkbox' value='"+v+"'/>";
    },
    
    formatRow:function(d){
        var ret = '';
        for(c in u_table.cols){
            //if(typeof d[u_table.cols[c].index] == 'undefined')continue;
            col = u_table.cols[c];
            if(col['type'] == 'text'||!col['type']){
                ret += '<td>'+d[u_table.cols[c].index]+'</td>';
            }
            else if(col['type'] == 'enum'){
                ret += '<td>'+u_table.formatEnum(d, u_table.cols[c])+'</td>';
            }
            else if(col['type'] == 'checkbox'){
                ret += '<td>'+u_table.formatCheckbox(d, u_table.cols[c])+'</td>';
            }
        }
        ret = "<tr>"+ret+"</tr>\n";
        return ret;
    },
    
    fillTable:function(cont, cols, data, option){
        var t = u_table.getTable(cols, data, option);
        cont.html(t);
        u_table.addEvent();
    },
    
    addEvent:function(){
        for(e in u_table.event){
            var event = u_table.event[e];
            if(event.type == 'checkbox'){
                var cb_class = event.extra;
                $("._all_"+cb_class).click(function(){
                    if($(this).is(':checked')){
                        $(this).parents("table").find("."+cb_class).each(function(){
                            this.checked = true;
                        });
                    }
                    else {
                        $(this).parents("table").find("."+cb_class).each(function(){
                            this.checked = false;
                        });
                    }
                });
            }
        }
    },
    
    clearEvent:function(){
        for(e in u_table.event){
            var event = u_table.event[e];
            if(event.type == 'checkbox'){
                var cb_class = event.extra;
                $("._all_"+cb_class).unbind();
            }
        }
    }
};


var u_page = {
    data_page_param:'_page',
    page:1,
    page_total:1,
    item_total:0,
    go:function(){},
    getPage:function(option){
        var total_span = '<span>(共 '+u_page.page_total+' 页 '+u_page.item_total+' 条)</span>';
        var page_tpl = '<div class="pagination"><ul>'
                    + '<li><a class="first" href="javascript:">最前页</a></li>'
                    + '<li><a class="prev" href="javascript:">前一页</a></li>'
                    + '<li class=active><a href="javascript:">'+u_page.page+'</a></li>'
                    + '<li><a class="next" href="javascript:">后一页</a></li>'
                    + '<li><a class="last" href="javascript:">最后页</a></li>'
                    + '</ul>'
                    + total_span;
                    + '</div>';
        return page_tpl;
    },
    
    addEvent:function(){
        $(".pagination .first").click(function(){
            u_page.go(1);
        });
        $(".pagination .prev").click(function(){
            u_page.go(u_page.page-1 > 0 ? u_page.page-1 : 1);
        });
        $(".pagination .next").click(function(){
            u_page.go(u_page.page+1 < u_page.page_total ? u_page.page+1 : u_page.page_total);
        });
        $(".pagination .last").click(function(){
            u_page.go(u_page.page_total);
        });
    },
    
    clearEvent:function(){
        $(".pagination .first").unbind();
        $(".pagination .prev").unbind();
        $(".pagination .next").unbind();
        $(".pagination .last").unbind();
    },
    
    fillPage:function(cont, option){
        if(option['page']) {
            u_page.page = option['page'];
        }
        if(option['total']) {
            u_page.item_total = option['total'];
            u_page.page_total = Math.ceil(option['total']/option['page_size']);
        }
        if($.isFunction(option['page_method'])){
            u_page.go = option['page_method'];
        }
        
        u_page.clearEvent();
        
        var t = u_page.getPage(option);
        cont.html(t);
        u_page.addEvent();
    }
}
