import './widget-datetime-item.js';
import datex from './datex.js';

import styleSheet from './style/widget.css' assert { type: 'css'};

const DATE_PATTERN = 'YYYY-MM-DD';
const TIME_PATTERN = 'HH:mm:ss';
const patternMap = {
    datetime:DATE_PATTERN+' '+TIME_PATTERN,
    date:DATE_PATTERN,
    time:TIME_PATTERN
};
const regexMap = {
    datetime:/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
    date:/\d{4}-\d{2}-\d{2}/,
    time:/\d{2}:\d{2}:\d{2}/
};

class WidgetInput extends HTMLElement {
    static formAssociated = true;
    #internals;
    #value;             // 缓存旧值
    #param
    constructor(params) {
        super();
        const _ = this;
        _.#param = params;
        _.#internals = this.attachInternals();
        _.attachShadow({mode:'open'});
    }
    static get observedAttributes(){
        return ['type','value','start','end','placeholder','pattern','range','limit'];
    }
    get type(){
        return this.getAttribute('type')||this.#param?.type||'datetime';
    }
    set type(value){
        return this.setAttribute('type',value);
    }
    get value(){
        this.#value = this.getAttribute('value')||'';
        return this.#value;
    }
    set value(value){
        this.#value = value;
        return this.setAttribute('value',this.#value);
    }
    get placeholder(){
        return this.getAttribute('placeholder')||'';
    }
    set placeholder(value){
        return this.setAttribute('placeholder',value);
    }
    get pattern(){
        return this.getAttribute('pattern')||'';
    }
    set pattern(value){
        return this.setAttribute('pattern',value);
    }
    get range(){
        const range = this.getAttribute('range');
        return range?(new Function(`return ${range}`))():[];
    }
    set range(value){
        const range = value.length?JSON.stringify(value):'';
        return this.setAttribute('range',range);
    }
    get limit(){
        const limit = this.getAttribute('limit');
        return limit?(new Function(`return ${limit}`))():[];
    }
    set limit(value){
        const limit = value.length?JSON.stringify(value):'';
        return this.setAttribute('limit',limit);
    }
    get start(){
        return this.getAttribute('start')||'';
    }
    set start(value){
        return this.setAttribute('start',value);
    }
    get end(){
        return this.getAttribute('end')||'';
    }
    set end(value){
        return this.setAttribute('end',value);
    }
    attributeChangedCallback(name, oldValue, newValue){
        if(oldValue!=newValue){
            if(name=='placeholder'){
                this.$input?.setAttribute('placeholder',newValue);
            }else if(!['value','start','end','link','range','limit'].includes(name)){
                this.$pickerBody&&this.formatPicker();
            }
        }
    }
    connectedCallback () {
        let _ = this;
        // 模板
        if(_.shadowRoot.adoptedStyleSheets){
            _.shadowRoot.adoptedStyleSheets = [styleSheet];
        }else{
            const $style = document.createElement('style');
            $style.rel = 'stylesheet';
            $style.textContent = [...styleSheet.cssRules].map(item=>item.cssText).join('');
            _.shadowRoot.appendChild($style);
        }
        // 节点渲染
        _.render();
        // 事件绑定
        _.$module = _.shadowRoot.querySelector('.mod-datetime');
        _.$input = _.$module.querySelector('input');
        _.$button = _.$module.querySelector('button');
        _.$picker = _.shadowRoot.querySelector('#picker');
        _.$pickerBody = _.$picker.querySelector('.picker-body');
        const openPicker = function(){
            if(_.device=='mobile'||globalThis?.innerWidth<600){
                _.$picker.showModal();
                document.body.style.overflow = 'hidden';
            }else{
                _.$picker.show();
            }
            _.formatPicker();
        };
        const closePicker = function(){
            document.body.style.overflow = '';
            _.$picker.close();
            _.$input.value = _.value = _.#value;
            if(_.type.includes('-range')){
                [_.start='',_.end=''] = _.value.split(' 至 ');
            }
        };
        // 初始化
        _.formatPicker();
        /***** 事件绑定 *****/
        // 鼠标移动切换
        _.$module.addEventListener('mouseenter', function(){
            if(_.value){
                _.$button.classList.add('active');
            }else{
                _.$button.classList.remove('active');
            }
        });
        _.$module.addEventListener('mouseleave', function(){
            _.$button.classList.remove('active');
        });
        // 点击右侧图标
        _.$button.addEventListener('click',function(){
            if(_.$button.classList.contains('active')){
                _.$button.classList.remove('active')
                _.$input.value = _.#value = _.value = '';
                if(_.$current){
                    _.$current.value = '';
                }
                if(_.$start){
                    _.$start.value = '';
                }
                if(_.$end){
                    _.$end.value = '';
                }
                closePicker();
            }else{
                openPicker();
            }
        });
        // 打开选择器
        _.$input.addEventListener('click', function(){
            openPicker();
        });
        // 关闭选择器
        document.addEventListener('click', (event) => {
            if(_.$picker.open&&event.target!=_) {
                closePicker();
            }
        });
        // 选择器选择
        const $cancel = _.$picker.querySelector('.btn-cancel');
        const $confirm = _.$picker.querySelector('.btn-confirm');
        const $select = _.$picker.querySelector('.btn-select');
        $cancel?.addEventListener('click',function(){
            closePicker();
        });
        $confirm?.addEventListener('click',function(){
            _.value = _.$input.value = _.getValue();
            if(_.#value!=_.value){
                _.#value = _.value;
                _.dispatchEvent(new CustomEvent('onChange',{'detail':{
                    value:_.value,
                    province:_.province,
                    city:_.city,
                    district:_.district
                }}));
                _.dispatchEvent(new UIEvent('change')); 
            }
            closePicker();
        });
        // 选择当前值
        $select?.addEventListener('click',function(){
            const item = datex();
            const type = _.type.replace('-range','');
            const pattern = _.pattern||patternMap[type];
            if(_.$current){
                _.$current.value = item.format(pattern);
            }
            if(_.$start){
                _.$start.value = item.format(pattern);
            }
            if(_.$end){
                _.$end.value = item.format(pattern);
            }
            _.$input.value = _.getValue();
        });
    }
    // 渲染组件
    render(){
        let _ = this;
        _.shadowRoot.innerHTML = `
            <div class="mod-datetime">
                <input type="text" name="datetime" readonly/>
                <button>&nbsp;</button>
            </div>
            <dialog id="picker">
                <div class="picker-container">
                    <div class="picker-body"></div>
                    <div class="picker-foot">
                        <div class="text-left">
                            <button class="btn btn-select">此刻</button>
                        </div>
                        <div class="text-right">
                            <button class="btn btn-cancel">取消</button>
                            <button class="btn btn-confirm">确定</button>
                        </div>
                    </div>
                </div>
            </dialog>
        `;
    }
    // 获取当前选择值
    getValue(){
        const _ = this;
        const type = _.type.replace('-range','');
        if(_.type.includes('-range')){
            let start = _.$start.value;
            let end = _.$end.value;
            start = start.match(regexMap[type])?start:'';
            end = end.match(regexMap[type])?end:'';
            return start&&end?`${_.formatValue(start)} 至 ${_.formatValue(end)}`:'';
        }else{
            let value = _.$current.value;
            value = value.match(regexMap[type])?value:'';
            return _.formatValue(value);
        }
    }
    // 格式化值
    formatValue(value){
        const _ = this;
        const valueMatch = value.match(/(\d{4}-\d{2}-\d{2})?\s?(\d{2}:\d{2}(:\d{2})?)?/);
        if(valueMatch?.[1]||valueMatch?.[2]){
            const key = `${valueMatch[1]||datex().format(DATE_PATTERN)} ${valueMatch[2]||'00:00:00'}`;
            const type = _.type.replace('-range','');
            const custom_pattern = _.pattern||patternMap[type];
            const item = datex(key);
            return item.format(custom_pattern);
        }
        return '';
    }
    // 格式化选择器
    formatPicker(){
        const _ = this;
        const isRange = ['datetime-range','date-range','time-range'].includes(_.type);
        const type = _.type.replace('-range','');
        const range = _.range.length?JSON.stringify(_.range):'';
        const limit = _.limit.length?JSON.stringify(_.limit):'';
        const custom_pattern = _.pattern||patternMap[type];
        const static_pattern = patternMap[type];
        const todayItem = datex();
        const date = todayItem.format(patternMap['date']);
        const time = todayItem.format(patternMap['time']);
        if(type=='date'){
            _.$button.classList.add('date');
            _.$button.classList.remove('time');
        }else if(type=='time'){
            _.$button.classList.remove('date');
            _.$button.classList.add('time');
        }else{
            _.$button.classList.remove('date');
            _.$button.classList.remove('time');
        }
        if(isRange){
            if(!(_.start&&_.end)){
                [_.start='',_.end=''] = _.value.split(' 至 ');
            }
            let start = _.start;
            let end = _.end;
            if(type=='date'){
                start = `${start} ${time}`;
                end = `${end} ${time}`;
            }else if(type=='time'){
                start = `${date} ${start}`;
                end = `${date} ${end}`;
            }
            const startItem = _.parseValue(start,custom_pattern);
            const endItem = _.parseValue(end,custom_pattern);
            const startValue = _.start&&startItem?startItem.format(static_pattern):'';
            const endValue = _.end&&endItem?endItem.format(static_pattern):'';
            _.$pickerBody.innerHTML = `
                <widget-datetime-item type="${type}" role="start" value="${startValue}" pattern="${custom_pattern}"  link="${endValue}" range='${range}' limit='${limit}'></widget-datetime-item>
                <widget-datetime-item type="${type}" role="end" value="${endValue}" pattern="${custom_pattern}" link="${startValue}" range='${range}' limit='${limit}'></widget-datetime-item>
            `;
        }else{
            let value = _.value;
            if(type=='date'){
                value = `${value} ${time}`;
            }else if(type=='time'){
                value = `${date} ${value}`;
            }
            const currentItem = _.parseValue(value,custom_pattern);
            const currentValue = _.value&&currentItem?currentItem.format(static_pattern):'';
            _.$pickerBody.innerHTML = `
                <widget-datetime-item type="${type}" role="current" value="${currentValue}" pattern="${custom_pattern}" range='${range}' limit='${limit}'></widget-datetime-item>
            `;
        }
        _.$start = _.$picker.querySelector('widget-datetime-item[role="start"]');
        _.$end = _.$picker.querySelector('widget-datetime-item[role="end"]');
        _.$current = _.$picker.querySelector('widget-datetime-item[role="current"]');
        _.$input.value = _.value = _.#value = _.getValue();   // 初始化时格式化下，标准显示
        _.$input.setAttribute('placeholder',_.placeholder);
        _.#internals.setFormValue(_.value);
        if(_.$current){
            _.$current.addEventListener('onSelect',function(data){
                _.$input.value = _.getValue();
            });
        }
        if(_.$start){
            _.$start.addEventListener('onSelect',function(data){
                const start = data.detail.value;
                _.$end.link = start;
                if(_.$end.value&&start>_.$end.value){
                    _.$end.value = start;
                    _.$start.link = start;
                }
                _.$input.value = _.getValue();
            });
        }
        if(_.$end){
            _.$end.addEventListener('onSelect',function(data){
                const end = data.detail.value;
                _.$start.link = end;
                if(_.$start.value&&end<_.$start.value){
                    _.$start.value = end;
                    _.$end.link = end;
                }
                _.$input.value = _.getValue();
            });
        }
    }
    // 解析值
    parseValue(value,pattern = 'YYYY-MM-DD HH:mm:ss'){
        let result = null;
        result = datex(value);
        if(!result.isValid()){
            result = datex(value,pattern);
        }
        return result.isValid()?result:null;
    }
}

class WidgetDatetime extends WidgetInput {
    constructor() {
        super({
            type:'datetime'
        });
    }
    static get observedAttributes() {
        return [...super.observedAttributes];
    }
}

class WidgetDate extends WidgetInput {
    constructor() {
        super({
            type:'date'
        });
    }
    static get observedAttributes() {
        return [...super.observedAttributes];
    }
}

class WidgetTime extends WidgetInput {
    constructor() {
        super({
            type:'time'
        });
    }
    static get observedAttributes() {
        return [...super.observedAttributes];
    }
}

class WidgetDatetimeRange extends WidgetInput {
    constructor() {
        super({
            type:'datetime-range'
        });
    }
    static get observedAttributes() {
        return [...super.observedAttributes];
    }
}

class WidgetDateRange extends WidgetInput {
    constructor() {
        super({
            type:'date-range'
        });
    }
    static get observedAttributes() {
        return [...super.observedAttributes];
    }
}

class WidgetTimeRange extends WidgetInput {
    constructor() {
        super({
            type:'time-range'
        });
    }
    static get observedAttributes() {
        return [...super.observedAttributes];
    }
}

if(!customElements.get('widget-datetime')){
    customElements.define('widget-datetime', WidgetDatetime);
}
if(!customElements.get('widget-date')){
    customElements.define('widget-date', WidgetDate);
}
if(!customElements.get('widget-time')){
    customElements.define('widget-time', WidgetTime);
}
if(!customElements.get('widget-datetime-range')){
    customElements.define('widget-datetime-range', WidgetDatetimeRange);
}
if(!customElements.get('widget-date-range')){
    customElements.define('widget-date-range', WidgetDateRange);
}
if(!customElements.get('widget-time-range')){
    customElements.define('widget-time-range', WidgetTimeRange);
}