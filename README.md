# 基于Web component的日期时间选择器

## 演示地址
[https://passer-by.com/widget-datetime/](https://passer-by.com/widget-datetime/)


## 网页组件

### 选择日期和时间
```html
<widget-datetime value=""></widget-datetime>
```

### 选择日期
```html
<widget-date value=""></widget-date>
```

### 选择时间
```html
<widget-time value=""></widget-time>
```

### 选择日期和时间范围
```html
<widget-datetime-range value=""></widget-datetime-range>
```

### 选择日期范围
```html
<widget-date-range value=""></widget-date-range>
```

### 选择时间范围
```html
<widget-time-range value=""></widget-time-range>
```


## 属性说明
<table>
    <caption><h3>组件属性</h3></caption>
    <thead>
        <tr>
            <th>属性</th>
            <th>参考值</th>
            <th>说明</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>placeholder</td>
            <td>'请选择日期'</td>
            <td>为空时占位提醒</td>
        </tr>
        <tr>
            <td>value</td>
            <td>'2026-01-01'</td>
            <td>默认值</td>
        </tr>
        <tr>
            <td>pattern</td>
            <td>'YYYY年MM月DD日'</td>
            <td>
                <p>格式化值</p>
                <p>YYYY - 年</p>
                <p>MM - 月</p>
                <p>DD - 日</p>
                <p>HH - 小时</p>
                <p>mm - 分钟</p>
                <p>ss - 秒</p>
            </td>
        </tr>
        <tr>
            <td>range</td>
            <td>[['2026-01-01','2026-06-30']]</td>
            <td>
                <p>限制选择范围</p>
                <p>[['2026-01-01','2026-06-30']] - 限制日期</p>
                <p>[['09:00','21:00']] - 限制时间</p>
                <p>[['2026-01-01',null]] - 单向限制</p>
            </td>
        </tr>
        <tr>
            <td>limit</td>
            <td>['weekend']</td>
            <td>
                <p>限制类型</p>
                <p>weekend - 周末</p>
                <p>weekday - 工作日</p>
                <p>sunday/monday/tuesday/wednesday/thursday/friday/saturday - 单向限制</p>
            </td>
        </tr>
    </tbody>
</table>
