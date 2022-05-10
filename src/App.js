import React, { PureComponent} from 'react';
import './App.css';
import * as XLSX from 'xlsx';

const MyContext = React.createContext();
const {Provider,Consumer} = MyContext;
class ccc extends PureComponent{}
export default class App extends PureComponent {
  
  state = {
    excelData:[],
    test:[1,2,3],
    carName:"奔驰E63",
    userName:'Tom'
  }
  onImportExcel= file => {
    // 获取上传的文件对象
    const { files } = file.target;
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = event => {
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: 'binary' });
        let data = []; // 存储获取到的数据
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
            // break; // 如果只取第一张表，就取消注释这行
          }
        }
        this.setState({
          excelData:data
        })
        console.log(111,this.state.excelData)
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        alert('文件类型不正确');
        return;
      }
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(files[0]);
  }
  reverse = ()=>{
    const reverseDate = this.state.excelData.filter(item=>{
      const resultarr= item.numbering.split('/').reverse();
      resultarr.splice(1,0,'/');
      const resultStr = resultarr.join("");
      return item.result=resultStr
    })
    this.setState({
      excelData:reverseDate
    })
  }
  // csv转sheet对象
//  csv2sheet=(csv)=> {
//     const sheet = {}; 
//     console.log('ccc',csv)
//     csv = csv.split('\n');
//     csv.forEach((row, i)=> {
//       row = row.split(',');
//       if(i == 0) sheet['!ref'] = 'A1:'+String.fromCharCode(65+row.length-1)+(csv.length-1);
//       row.forEach(function(col, j) {
//         sheet[String.fromCharCode(65+j)+(i+1)] = {v: col};
//       });
//     });
//     return sheet;
//   }
  // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
  sheet2blob =(sheet, sheetName) =>{
    sheetName = sheetName || 'sheet1';
    var workbook = {
      SheetNames: [sheetName],
      Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    var wopts = {
      bookType: 'xlsx', // 要生成的文件类型
      bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
    // 字符串转ArrayBuffer
    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
    return blob;
  }
  openDownloadDialog=(url, saveName)=>{
    if(typeof url == 'object' && url instanceof Blob)
    {
      url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
  }

  downloadData = ()=>{   
    var sheet = XLSX.utils.json_to_sheet(this.state.excelData);
    this.openDownloadDialog(this.sheet2blob(sheet),'导出.xlsx')
  }
  changeCar = ()=>{
    this.setState({
      carName:"迈巴赫"
    })
  }
  render() {
    console.log("parent-render")
    const {carName,userName} = this.state
    return (
      <div className="App">
        <div className="hide">
          <h2>hello 宝</h2>
          <div className="edit-box">
            <input className="upload-btn" type='file' accept='.xlsx, .xls' onChange={this.onImportExcel} />
            <button className="reverse-btn" onClick={this.reverse}>反转</button>
            <button className="download-btn" onClick={this.downloadData}>导出Excel</button>
          </div>
          
          <div className="data-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>numbering</th>
                  <th>result</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.excelData.length>0?(
                    this.state.excelData.map(item=>{
                      return <tr key={item.__rowNum__}>
                              <td>{item.numbering}</td>
                              <td>{item.result?item.result:'-'}</td>
                            </tr>
                    })
                  ):(
                    <tr>
                      <td>-</td>
                      <td>-</td>
                    </tr>
                  )
                }    
              </tbody>
            </table>
          </div>
        </div>
        <h3>Parent组件</h3>
        <div>车名：{carName}</div>
        <div>人名：{userName}</div>
        <br />
        <button onClick={this.changeCar}>换车</button>       
        {/* <Provider value={userName}> */}
        <Provider value={{carName,userName}}>
          <Child carName={carName}/>
        </Provider>        
      </div>
    )
  };
};
class Child extends PureComponent{
  render(){
    console.log("child-render")
    return(
      <div className="child-box">
        <h3>child组件</h3>
        <div>收到的车名:{this.props.carName}</div>       
        <Children/>  
        <Children2/>
      </div>
    )   
  }
}

class Children extends PureComponent{
  static contextType = MyContext  
  render(){
    return(
      <div className="children-box">
        <h3>children组件</h3>
        <div>收到车名：{this.context.carName},人名：{this.context.userName}</div>
      </div>
    )
  }
}

function Children2(){  
  return(
    <div className="children-box">
      <h3>函数children组件2</h3>
      <Consumer>
        {
          value=>{
            console.log(value)
            return(
              <div>车名：{value.carName},人名：{value.userName}</div>
            )
          }
        }
      </Consumer>
    </div>
  )
}