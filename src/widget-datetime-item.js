import { minYear,maxYear } from './module/method/config/base.js';
import {periodMap} from './module/method/config/period.js';
import datex from './datex.js';

import styleSheet from './style/widget-item.css' assert { type: 'css'};

const DATE_PATTERN = 'YYYY-MM-DD';
const TIME_PATTERN = 'HH:mm:ss';

// 获取索引
function getChildElementIndex($child) {
    if (!($child instanceof HTMLElement) || !$child.parentElement) {
        return -1;
    }
    const siblings = Array.from($child.parentElement.children);
    return siblings.indexOf($child);
}
// 滚动节点
function targetScroll($target){
    const $active = $target.querySelector('li.active') || $target.querySelector('li:not(.disabled)');
    const index = getChildElementIndex($active);
    $target.scrollTo({
        top: index*32
    });
}
var observer = new IntersectionObserver(changes => {
    for (const change of changes) {
        if(change.isIntersecting){
            targetScroll(change.target);
        }
    }
}, {});

// 时间选择对象，值为时间戳
class WidgetDatetimeItem extends HTMLElement {
    #date = '';          // 实际选择日期
    #dateCache = '';     // 隐形选择日期
    #hour = '';          // 实际选择小时
    #minute = '';        // 实际选择分钟
    #second = '';        // 实际选择秒数
    #time = '';          // 实际选择日期
    #hourCache = '';     // 隐形选择小时
    #minuteCache = '';   // 隐形选择分钟
    #secondCache = '';   // 隐形选择秒数
    #timeCache = '';     // 隐形选择时间
    #link_date = '';     // 关联日期
    #link_dateCache = '';// 隐形关联日期
    #link_time = '';     // 关联时间
    #link_hour = '';     // 关联小时
    #link_minute = '';   // 关联分钟
    #link_second = '';   // 关联秒数
    #hasHour = true;
    #hasMinute = true;
    #hasSecond = true;
    constructor() {
        super();
        this.attachShadow({mode:'open'});

        // 全局变量
        let _ = this;
        _.today = datex();
        _.currentMonthData = [];        // 当前日期所在月份数据
        _.currentMonthDay = 1;          // 当前日期当月几号
    }
    static get observedAttributes(){
        return ['type','value','role','link','range','steps'];
    }
    // 表单类型
    get type(){
        return this.getAttribute('type')||'datetime';
    }
    set type(value){
        return this.setAttribute('type',value);
    }
    // 选择的值
    get value(){
        return this.getAttribute('value')||'';
    }
    set value(value){
        return this.setAttribute('value',value);
    }
    // 角色
    get role(){
        return this.getAttribute('role')||'start';
    }
    set role(value){
        return this.setAttribute('role',value);
    }
    // 关联值
    get link(){
        return this.getAttribute('link')||'';
    }
    set link(value){
        return this.setAttribute('link',value);
    }
    // 匹配值
    get pattern(){
        return this.getAttribute('pattern')||'';
    }
    set pattern(value){
        return this.setAttribute('pattern',value);
    }
    // 限制有效范围
    get range(){
        const range = this.getAttribute('range');
        return range?JSON.parse(range):[];
    }
    set range(value){
        const range = value.length?JSON.stringify(value):'';
        return this.setAttribute('range',range);
    }
    get limit(){
        const limit = this.getAttribute('limit');
        return limit?JSON.parse(limit):[];
    }
    set limit(value){
        const limit = value.length?JSON.stringify(value):'';
        return this.setAttribute('limit',limit);
    }
    get steps(){
        return +this.getAttribute('steps')||1;
    }
    set steps(value){
        return this.setAttribute('steps',value);
    }
    attributeChangedCallback(name, oldValue, newValue){
        if(oldValue!=newValue&&newValue!=null&&oldValue!=null){
            if(name=='value'){
                this.setValue(newValue);
            }else if(name="link"){
                this.setLink(newValue);
            }
            this.formatItem();
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
        _.$module = _.shadowRoot.querySelector('.picker-item');
        _.$year = _.$module.querySelector('select[name="year"]');
        _.$month = _.$module.querySelector('select[name="month"]');
        _.$prev_year = _.$module.querySelector('.prev-year');
        _.$next_year = _.$module.querySelector('.next-year');
        _.$prev_month = _.$module.querySelector('.prev-month');
        _.$next_month = _.$module.querySelector('.next-month');
        _.$tbody = _.$module.querySelector('tbody');
        _.$hour = _.$module.querySelector('ul[data-type="hour"]');
        _.$minute = _.$module.querySelector('ul[data-type="minute"]');
        _.$second = _.$module.querySelector('ul[data-type="second"]');
        _.$time = _.$module.querySelector('.picker-time-value');
        // 日期变化
        const changeDate = function(year,month,day){
            const date = datex(year,month,day).format(DATE_PATTERN);
            if(date!=_.#dateCache){
                _.#dateCache = date;
                _.formatItem();
            }
        };

        if(_.$prev_year){
            _.$prev_year.addEventListener('click',function(){
                let year = _.$year.value||_.$year.getAttribute('data-value');
                let month = _.$month.value||_.$month.getAttribute('data-value');
                year--;
                changeDate(year,month,1);
            });
        }
        if(_.$next_year){
            _.$next_year.addEventListener('click',function(){
                let year = _.$year.value||_.$year.getAttribute('data-value');
                let month = _.$month.value||_.$month.getAttribute('data-value');
                year++;
                changeDate(year,month,1);
            });
        }
        if(_.$year){
            _.$year.addEventListener('change',function(){
                let year = _.$year.value||_.$year.getAttribute('data-value');
                let month = _.$month.value||_.$month.getAttribute('data-value');
                changeDate(year,month,1);
            });
        }
        if(_.$prev_month){
            _.$prev_month.addEventListener('click',function(){
                let year = _.$year.value||_.$year.getAttribute('data-value');
                let month = _.$month.value||_.$month.getAttribute('data-value');
                month--;
                changeDate(year,month,1);
            });
        }
        if(_.$next_month){
            _.$next_month.addEventListener('click',function(){
                let year = _.$year.value||_.$year.getAttribute('data-value');
                let month = _.$month.value||_.$month.getAttribute('data-value');
                month++;
                changeDate(year,month,1);
            });
        }
        if(_.$month){
            _.$month.addEventListener('change',function(){
                let year = _.$year.value||_.$year.getAttribute('data-value');
                let month = _.$month.value||_.$month.getAttribute('data-value');
                changeDate(year,month,1);
            });
        }
        if(_.$tbody){
            _.$tbody.addEventListener('click',function(event){
                let target = event.target;
                while(target.tagName!='TD'&&target.tagName!='TABLE'){
                    target = target.parentNode;
                }
                let date = target.getAttribute('data-date');
                if(target.tagName=='TD'&&!target.classList.contains('disabled')){
                    const isRefresh = !_.#date;
                    _.#date = date;
                    _.#hour = '';
                    _.#minute = '';
                    _.#second = '';
                    const thatDay = datex(`${_.#date} 00:00:00`);
                    changeDate(thatDay.get('year'),thatDay.get('month'),thatDay.get('day'));
                    if(isRefresh){
                        _.formatItem();
                    }
                }
            });
        }
        if(_.$hour){
            _.$hour.addEventListener('click',function(event){
                let target = event.target;
                while(target.tagName!='LI'&&target.tagName!='UL'){
                    target = target.parentNode;
                }
                if(target.tagName=='LI'&&!target.classList.contains('disabled')){
                    _.#hour = target.getAttribute('data-value');
                    _.#minute = '';
                    _.#second = '';
                    _.#hourCache = '';
                    _.#minuteCache = '';
                    _.#secondCache = '';
                    _.formatItem();
                }
            });
            observer.observe(_.$hour);
        }
        if(_.$minute){
            _.$minute.addEventListener('click',function(event){
                let target = event.target;
                while(target.tagName!='LI'&&target.tagName!='UL'){
                    target = target.parentNode;
                }
                if(target.tagName=='LI'&&!target.classList.contains('disabled')){
                    _.#minute = target.getAttribute('data-value');
                    _.#second = '';
                    _.#hourCache = '';
                    _.#minuteCache = '';
                    _.#secondCache = '';
                    _.formatItem();
                }
            });
            observer.observe(_.$minute);
        }
        if(_.$second){
            _.$second.addEventListener('click',function(event){
                let target = event.target;
                while(target.tagName!='LI'&&target.tagName!='UL'){
                    target = target.parentNode;
                }
                if(target.tagName=='LI'&&!target.classList.contains('disabled')){
                    _.#second = target.getAttribute('data-value');
                    _.#hourCache = '';
                    _.#minuteCache = '';
                    _.#secondCache = '';
                    _.formatItem();
                }
            });
            observer.observe(_.$second);
        }

        // 初始化
        _.setValue(this.value);
        _.setLink(this.link);
        _.formatItem();
    }
    // 渲染时间控件
    render(){
        let _ = this;
        let template = '';
        if(_.pattern){
            _.#hasHour = _.pattern.includes('H');
            _.#hasMinute = _.pattern.includes('m');
            _.#hasSecond = _.pattern.includes('s');
        }
        if(['datetime','date'].includes(this.type)){
            template += `<div class="picker-date">
                <div class="picker-selector">
                    <span>
                        <a class="prev prev-year" href="javascript:;">&lt;</a>
                        <select name="year">
                            ${(function(){
                                const list = [];
                                for(let i=minYear;i<=maxYear;i++){
                                    list.push(`<option value="${i}">${i}年</option>`);
                                }
                                return list.join('');
                            })()}
                        </select>
                        <a class="next next-year" href="javascript:;">&gt;</a>
                    </span>
                    <span>
                        <a class="prev prev-month" href="javascript:;">&lt;</a>
                        <select name="month">
                            ${(function(){
                                const list = [];
                                for(let i=1;i<=12;i++){
                                    list.push(`<option value="${i}">${i}月</option>`);
                                }
                                return list.join('');
                            })()}
                        </select>
                        <a class="next next-month" href="javascript:;">&gt;</a>
                    </span>
                </div>
                <div class="picker-content">
                    <table>
                        <thead>
                            <tr>
                                <th><span>日</span></th>
                                <th><span>一</span></th>
                                <th><span>二</span></th>
                                <th><span>三</span></th>
                                <th><span>四</span></th>
                                <th><span>五</span></th>
                                <th><span>六</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>`;
        }
        if(['datetime','time'].includes(this.type)){
            template += `
                <div class="picker-time">
                    <div class="picker-time-value">
                        ${
                            [_.#hasHour,_.#hasMinute, _.#hasSecond].filter(value=>value).map(value=>'--').join(':')
                        }
                    </div>
                    <div class="picker-scroll">
                        <div class="picker-scroll-head">
                            ${_.#hasHour?'<span>时</span>':''}
                            ${_.#hasMinute?'<span>分</span>':''}
                            ${_.#hasSecond?'<span>秒</span>':''}
                        </div>
                        <div class="picker-scroll-body">
                            ${_.#hasHour?'<ul data-type="hour"></ul>':''}
                            ${_.#hasMinute?'<ul data-type="minute"></ul>':''}
                            ${_.#hasSecond?'<ul data-type="second"></ul>':''}
                        </div>
                    </div>
                </div>
            `;
        }
        _.shadowRoot.innerHTML = `
            <div class="picker-item">${template}</div>
        `;
    }
    // 获取时间是否在有效范围内
    checkInTimeRange(timestamp){
        if(this.range.length){
            let isIn = false;
            const ranges = [];
            const time_ranges = [];
            this.range.map(function([start,end]){
                if(start.match(/^\d{2}:\d{2}(:\d{2})?$/)||end.match(/^\d{2}:\d{2}(:\d{2})?$/)){
                    time_ranges.push([
                        start!==null?(start+':00').substring(0,8):null,
                        end!==null?(end+':00').substring(0,8):null
                    ]);
                }else{
                    ranges.push([
                        start!==null?datex(start).getTime():null,
                        end!==null?datex(end).getTime():null
                    ]);
                }
            });
            if(ranges.length){
                ranges.forEach(function([start,end]){
                    if(start!==null&&end!==null){
                        if(timestamp>=start&&timestamp<=end){
                            isIn = true;
                        }
                    }else if(start!==null){
                        if(timestamp>=start){
                            isIn = true;
                        }
                    }else if(end!==null){
                        if(timestamp<=end){
                            isIn = true;
                        }
                    }
                });
            }else{
                time_ranges.forEach(function([start,end]){
                    const time = datex(timestamp).format(TIME_PATTERN);
                    if(start!==null&&end!==null){
                        if(time>=start&&time<=end){
                            isIn = true;
                        }
                    }else if(start!==null){
                        if(time>=start){
                            isIn = true;
                        }
                    }else if(end!==null){
                        if(time<=end){
                            isIn = true;
                        }
                    }
                });
            }
            return isIn;
        }
        return true;
    }
    // 获取时间可选范围
    getTimeRange(timestamp){
        const _ = this;
        const result = {
            hour:[],
            minute:[],
            second:[]
        };
        const offset = (new Date).getTimezoneOffset()*60000;
        const value = timestamp - offset;  // 时间戳和本地时差偏移修复
        const dayStart = Math.floor(value/periodMap['day'])*periodMap['day'];
        for(let hour=0;hour<24;hour++){
            const hourStart = dayStart + hour*periodMap['hour'];
            const hourEnd = hourStart + periodMap['hour'] - 1;
            if(_.checkInTimeRange(hourStart + offset)||_.checkInTimeRange(hourEnd + offset)){
                result['hour'][hour] = true;
            }else{
                result['hour'][hour] = false;
            }
        }
        const hourStart = Math.floor(value/periodMap['hour'])*periodMap['hour'];
        for(let minute=0;minute<60;minute++){
            const minuteStart = hourStart + minute*periodMap['minute'];
            const minuteEnd = minuteStart + periodMap['minute'] - 1;
            if(_.checkInTimeRange(minuteStart + offset)||_.checkInTimeRange(minuteEnd + offset)){
                result['minute'][minute] = true;
            }else{
                result['minute'][minute] = false;
            }
        }
        const minuteStart = Math.floor(value/periodMap['minute'])*periodMap['minute'];
        for(let second=0;second<60;second++){
            const secondStart = minuteStart + second*periodMap['second'];
            const secondEnd = secondStart + periodMap['second'] - 1;
            if(_.checkInTimeRange(secondStart + offset)||_.checkInTimeRange(secondEnd + offset)){
                result['second'][second] = true;
            }else{
                result['second'][second] = false;
            }
        }
        return result;
    }
    // 获取日期可选范围
    getDateRange(items){
        let result = [];
        const ranges = [];
        this.range.map(function([start,end]){
            if(start.match(/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)$/)||end.match(/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)$/)){
                ranges.push([
                    start!==null?datex(start).getTime():null,
                    end!==null?datex(end).getTime():null
                ]);
            }
        });
        if(ranges.length){
            ranges.forEach(function([start,end]){
                const item_start = items[0].getTime();
                const item_end = items[items.length-1].getTime();
                if(start===null){
                    start = item_start;
                }
                if(end===null){
                    end = item_end;
                }
                for(let time = Math.max(start,item_start);time<=Math.min(end,item_end);time+=periodMap['day']){
                    const date = datex(time).format(DATE_PATTERN);
                    if(!result.includes(date)){
                        result.push(date);
                    }
                }
            });
        }else{
            result = items.map(item=>item.format(DATE_PATTERN));
        }
        if(this.limit.length){
            const limits = this.limit.map(value=>value.toLowerCase());
            const weeks = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
            result = result.filter(function(date){
                const weekIndex = datex(date).get('week');
                const weekText = weeks[weekIndex];
                if(limits.includes(weekText)){
                    return true;
                }else if(limits.includes('weekend')&&['sunday','saturday'].includes(weekText)){
                    return true;
                }else if(limits.includes('weekday')&&['monday','tuesday','wednesday','thursday','friday'].includes(weekText)){
                    return true;
                }
                return false;
            });
        }
        return result;
    }
    // 获取当天最近的一个有效值
    findTimeEnabled(timestamp){
        const _ = this;
        const offset = (new Date).getTimezoneOffset()*60000;
        const value = timestamp - offset;  // 时间戳和本地时差偏移修复
        const dayStart = Math.floor(value/periodMap['day'])*periodMap['day'];
        const hourResult = _.getTimeRange(timestamp);
        const item = new Date(timestamp); 
        let hour = '';
        hourResult['hour'].forEach(function(isIn,index){
            if(isIn&&hour===''&&index>=item.getHours()){
                hour = index;
            }
        });
        const minuteResult = _.getTimeRange(dayStart + hour*periodMap['hour'] + offset);
        let minute = '';
        minuteResult['minute'].forEach(function(isIn,index){
            if(isIn&&minute===''&&index>=item.getMinutes()){
                minute = index;
            }
        });
        const secondResult = _.getTimeRange(dayStart + hour*periodMap['hour'] + minute*periodMap['minute'] + offset);
        let second = '';
        secondResult['second'].forEach(function(isIn,index){
            if(isIn&&second===''&&index>=item.getSeconds()){
                second = index;
            }
        });
        return {
            hour,
            minute,
            second
        };
    }
    // 设置当前值
    setValue(value){
        const _ = this;
        const item = datex();
        if(value===''){
            _.#dateCache = item.format(DATE_PATTERN);
        }else{
            const valueMatch = value.match(/(\d{4}\-\d{2}\-\d{2})?\s?(\d{2}:\d{2}:\d{2})?/);
            if(valueMatch){
                _.#date = valueMatch[1]||'';
                _.#dateCache = _.#date||item.format(DATE_PATTERN);
                if(valueMatch[2]){
                    const [hour,minute,second] = valueMatch[2].split(':');
                    _.#hour = (+hour).toString();
                    _.#minute = (+minute).toString();
                    _.#second = (+second).toString();
                }else{
                    _.#hour = '';
                    _.#minute = '';
                    _.#second = '';
                }
            }
        }
    }
    // 设置关联值
    setLink(value){
        const _ = this;
        const item = datex();
        if(value===''){
            _.#link_dateCache = item.format(DATE_PATTERN);
        }else{
            const valueMatch = value.match(/(\d{4}\-\d{2}\-\d{2})?\s?(\d{2}:\d{2}:\d{2})?/);
            if(valueMatch){
                _.#link_date = valueMatch[1]||'';
                _.#link_dateCache = _.#link_date;
                _.#link_time = valueMatch[2]||'';
                if(valueMatch[2]){
                    const [hour,minute,second] = valueMatch[2].split(':');
                    _.#link_hour = (+hour).toString();
                    _.#link_minute = (+minute).toString();
                    _.#link_second = (+second).toString();
                }else{
                    _.#link_hour = '';
                    _.#link_minute = '';
                    _.#link_second = '';
                }
            }
        }
    }
    // 获取当前值
    getValue(){
        const _ = this;
        if(_.type=='datetime'){
            return [_.#date||'',_.#time||''].join(' ').trim('');
        }else if(_.type=='date'){
            return _.#date||'';
        }else if(_.type=='time'){
            return _.#time||'';
        }
    }
    // 格式化日期
    formatItem(){
        const _ = this;
        _.#timeCache = `${_.#hour.toString().padStart(2,'0')}:${_.#minute.toString().padStart(2,'0')}:${_.#second.toString().padStart(2,'0')}`;
        const thatDay = datex(`${_.#dateCache} ${_.#timeCache}`);  // 界面参考时间对象
        const firstDay = thatDay.startOf('month');
        const lastDay = thatDay.endOf('month');
        // 数据计算
        const {
            hour:hourCache,
            minute:minuteCache,
            second:secondCache,
        } = _.findTimeEnabled(thatDay.getTime());// 如果时间有选择则使用选择的参数构建界面，否则找最近的一个有效值
        if(_.#date!==''||_.#hour!==''||_.#minute!==''||_.#second!==''){
            _.#hourCache = _.#hour = (_.#hour !=='' ? _.#hour : hourCache);
            _.#minuteCache = _.#minute = (_.#minute !=='' ? _.#minute :  minuteCache);
            _.#secondCache = _.#second = (_.#second !=='' ? _.#second : secondCache);
            _.#time = `${_.#hour.toString().padStart(2,'0')}:${_.#minute.toString().padStart(2,'0')}:${_.#second.toString().padStart(2,'0')}`;
        }else{
            _.#hourCache = hourCache;
            _.#minuteCache = minuteCache;
            _.#secondCache = secondCache;
            _.#time = '';
        }

        // 日历面板
        if(_.$year){
            _.$year.value = thatDay.get('year');
        }
        if(_.$month){
            _.$month.value = thatDay.get('month');
        }
        if(_.$tbody){
            // 记录日期面板每天数据
            _.currentMonthData = [];
            // 上月日期
            for(let i=firstDay.get('week');i>0;i--){
                let obj = datex(firstDay.get('year'),firstDay.get('month'),firstDay.get('day')-i);
                _.currentMonthData.push(obj);
            }
            // 当月日期
            for(let i=0;i<lastDay.get('day');i++){
                let obj = datex(firstDay.get('year'),firstDay.get('month'),firstDay.get('day')+i);
                _.currentMonthData.push(obj);
            }
            // 下月日期
            for(let i=1;lastDay.get('week')+i<7;i++){
                let obj = datex(lastDay.get('year'),lastDay.get('month'),lastDay.get('day')+i);
                _.currentMonthData.push(obj);
            }
            // 是否增加一行
            if(_.currentMonthData.length<=35){
                let lastDay = _.currentMonthData[_.currentMonthData.length-1];
                for(let i=1;_.currentMonthData.length<42;i++){
                    let obj = datex(lastDay.get('year'),lastDay.get('month'),lastDay.get('day')+i);
                    _.currentMonthData.push(obj);
                }
            }
            // 格式化结构
            let dateList = _.getDateRange(_.currentMonthData);
            let isInRange = false;
            let html = '<tr>';
            for(let i=0,len=_.currentMonthData.length;i<len;i++){
                const item = _.currentMonthData[i];
                const item_date = item.format(DATE_PATTERN);
                const classnameList = [];
                if(_.role=='start'){
                    if(_.#date&&_.#link_date){
                        isInRange = item_date>_.#date&&item_date<_.#link_date;
                    }else if(_.#date){
                        isInRange = item_date>_.#date;
                    }else if(_.#link_date){
                        isInRange = item_date<_.#link_date;
                    }else{
                        isInRange = false;
                    }
                }else if(_.role=='end'){
                    if(_.#link_date&&_.#date){
                        isInRange = item_date>_.#link_date&&item_date<_.#date;
                    }else if(_.#link_date){
                        isInRange = item_date>_.#link_date;
                    }else if(_.#date){
                        isInRange = item_date<_.#date;
                    }else{
                        isInRange = false;
                    }
                }
                if(isInRange&&dateList.includes(item_date)){
                    classnameList.push('range');
                }
                if(item_date==_.#link_date){
                    classnameList.push('link');
                }
                if(item_date==_.#date){
                    classnameList.push('active');
                }
                if(item.get('year')!=thatDay.get('year')||item.get('month')!=thatDay.get('month')){
                    classnameList.push('other');
                }
                if(item_date==_.today.format(DATE_PATTERN)){
                    classnameList.push('today');
                }
                if(!dateList.includes(item_date)){
                    classnameList.push('disabled');
                }
                html += `<td class="${classnameList.join(' ')}" data-date="${item_date}">
                    <a href="javascript:;">${item.get('day')}</a>
                </td>`;
                if(i%7==6&&i<len-1){
                    html+='</tr><tr>';
                }
            }
            html+='</tr>';
            _.$tbody.innerHTML = html;
        }


        // 时间面板
        if(_.$time){
            const timeText = [];
            if(_.#hasHour){
                timeText.push(_.#hour.toString().padStart(2,'0')||'--');
            }
            if(_.#hasMinute){
                timeText.push(_.#minute.toString().padStart(2,'0')||'--');
            }
            if(_.#hasSecond){
                timeText.push(_.#second.toString().padStart(2,'0')||'--');
            }
            _.$time.innerText = timeText.join(':');
        }
        const referDay = datex(thatDay.get('year'),thatDay.get('month'),thatDay.get('day'),_.#hourCache,_.#minuteCache,_.#secondCache);
        const timeRange = _.getTimeRange(referDay.getTime());
        if(_.$hour){
            _.$hour.innerHTML = (function(){
                const list = [];
                for(let i=0;i<24;i++){
                    const hour = i.toString();
                    const className = [];
                    if(_.#hour===hour){
                        className.push('active');
                    }
                    if(!timeRange['hour'][i]){
                        className.push('disabled');
                    }
                    list.push(`<li class="${className.join(' ')}" data-value="${i}">${hour.padStart(2,'0')}</li>`);
                }
                return list.join('');
            })();
            targetScroll(_.$hour);
        }
        if(_.$minute){
            _.$minute.innerHTML = (function(){
                const list = [];
                for(let i=0;i<60;i++){
                    const minute = i.toString();
                    const className = [];
                    if(_.#minute===minute){
                        className.push('active');
                    }
                    if(!timeRange['minute'][i]){
                        className.push('disabled');
                    }
                    list.push(`<li class="${className.join(' ')}" data-value="${i}">${minute.padStart(2,'0')}</li>`);
                }
                return list.join('');
            })();
            targetScroll(_.$minute);
        }
        if(_.$second){
            _.$second.innerHTML = (function(){
                const list = [];
                for(let i=0;i<60;i++){
                    const second = i.toString();
                    const className = [];
                    if(_.#second===second){
                        className.push('active');
                    }
                    if(!timeRange['second'][i]){
                        className.push('disabled');
                    }
                    list.push(`<li class="${className.join(' ')}" data-value="${i}">${second.padStart(2,'0')}</li>`);
                }
                return list.join('');
            })();
            targetScroll(_.$second);
        }

        let valueCache = _.getValue();
        const valueMatch = valueCache.match(/(\d{4}\-\d{2}\-\d{2})?\s?(\d{2}:\d{2}:\d{2})?/);
        if(valueMatch){
            const time = `${valueMatch[1]||datex().format(DATE_PATTERN)} ${valueMatch[2]||datex().format(TIME_PATTERN)}`;
            const item = datex(time);
            if(!_.checkInTimeRange(item.getTime())){
                _.#date = '';
                _.#hour = '';
                _.#minute = '';
                _.#second = '';
                valueCache = '';
            }
        }
        if(valueCache!=_.value){
            _.value = valueCache;
            _.dispatchEvent(new CustomEvent('onSelect',{'detail':{
                'value':_.value
            }}));
        }
    }
};


if(!customElements.get('widget-datetime-item')){
    customElements.define('widget-datetime-item', WidgetDatetimeItem);
}