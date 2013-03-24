
/*
 *
item:[{
    name:
    type: text select checkbox hidden button password
    value:
    label:
    extra:
}]

option:{
    action:
    method:
    target:
    class:
}
调用示例：
        var items = [{
            name: 'username',
            type: 'text',
            value: '',
            label: '帐号'
        },
        {
            name: 'password',
            type: 'password',
            value: '',
            label: '密码'
        },
        {
            name: 'type',
            type: 'select',
            value: '',
            label: '类型',
            extra: [{text:'类型1', value:1},{text:'类型2', value:2}]
        }];
        
        var option = {
            action:"/kohana/index.php/edit/_save"
        };
        
        u_form.fillForm($("#t_cont"), items);
*/

var u_form = {
    items:[],
    option:{},
    
    init:function(items, option){
        u_form.items = items;
        if($.isPlainObject(option)){
            u_form.option = option;
        }
        if(!u_form.option['method']){
            u_form.option['method'] = 'POST';
        }
        if(!u_form.option['action']){
            u_form.option['action'] = '';
        }
        if(!u_form.option['target']){
            u_form.option['target'] = '_self';
        }
    },
    
    getItems:function(items){
        ret = "";
        for(i in items){
            item = items[i];
            ret += u_form.getItem(item);
            ret += '<br>';
        }
        return ret;
    },
    
    getItem:function(item){
        ret = "";
        var v = typeof item.value != "undefined" ? item.value : "";
        var t = typeof item.type != "undefined" ? item.type : "";
        var l = typeof item.label != "undefined" ? item.label : "";
        var n = typeof item.name != "undefined" ? item.name : "";
        if(t == 'text'){
            ret += l+'<input name="'+n+'" type="text" value="'+v+'" />';
        }
        if(t == 'hidden'){
            ret += l+'<input name="'+n+'" type="text" value="'+v+'" />';
        }
        if(t == 'password'){
            ret += l+'<input name="'+n+'" type="text" value="'+v+'" />';
        }
        if(t == 'select'){
            var option = "<option value='-1'></option>";
            for(e in item.extra){
                var op = item.extra[e];
                option += "<option value='"+op.value+"'>"+op.text+"</option>";
            }
            ret += l+'<select name="'+n+'" value="'+v+'" >'+option+'</select>';
        }
        return ret;
    },
    
    getForm:function(){
        var ret = '';
        var items = u_form.items;
        
        ret += '<form action="'+u_form.option['action']+'" target="'+u_form.option['target']+'" method="'+u_form.option['method']+'">';
        
        ret += u_form.getItems(items);
        
        ret += '</form>';
        return ret;
    },
    
    fillForm:function(cont, items, option){
        u_form.init(items, option);
        var ret = u_form.getForm();
        cont.html(ret);
    }
};