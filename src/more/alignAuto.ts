// -------------------------------------------------------------------------------------------------
// Copyright (c) 2020-2023. All rights reserved.
// Project    :
// Filename   :    alignAuto.ts
// Author     :    Niechuan
// Email      :    niechuan.wk@gmail.com
// Description:
//
// ***********************************************************************************************
// Modification History:
// Date           By           Revision           Change Description
// -----------------------------------------------------------------------------------------------
// 2023-03-12                  1.0                origin
//
//
// ***********************************************************************************************
// Warning:
// Any bug or new reqirement, please report to the Author.
// ***********************************************************************************************
import * as vscode from 'vscode';
import Window = vscode.window;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;

export function alignAuto(){

    // console.log('Congratulations, your extension "my-verilog-extension" is now active!');
    // console.log("///The end of declare");

    if (!vscode.window.activeTextEditor) {
        vscode.window.showInformationMessage('Open a file first to manipulate text selections');
        return;
    }
        
    if(!Selection){
        //vscode.window.showInformationMessage('Nothing is selected.');
        vscode.window.showErrorMessage('Nothing is selected.');
        return;
    }
    let e = Window.activeTextEditor;
    let d = e.document;
    // let sel = e.selections;
    // let declareType = Selection.label;

    let sel = e.selection;// selection/selections的区别是什么？

    // 开始的行号
    let startLinenum = sel.start.line;
    let endLinenum = sel.end.line;
    // 开始的字符编号
    let startNum = sel.start.character;
    let endNum = sel.end.character;
    // console.log("startLinenum:" +  startLinenum.toString())
    // console.log("endLinenum:" +  endLinenum.toString())
    // console.log("startNum:" +  startNum.toString())
    // console.log("endNum:" +  endNum.toString())

    let selLineNum:number = endLinenum - startLinenum + 1
    let max1:number = 0 // 第一个列表长度
    let max2:number = 0 // 信号名长度
    let max3:number = 0 // 第二个列表长度
    for (let i = 0; i < selLineNum; i++) {
        // 获取范围之间的内容
        // let targetText:string = d.getText(new Range(new Position(startLinenum,startNum), new Position(endLinenum,endNum)));
        // Window.showInformationMessage(targetText);
        let targetText:string = d.lineAt(startLinenum+i).text
        // console.log(targetText)
        // 对选中的文本进行解析
        // reg|wire|logic|input|output [N-1:0] signal [N-1:0] ;
        // 长度可选：2/3/4
        let regExp1 = /(reg|wire|logic)\s*(\[.+\])?\s*(\w+)(\[.+\])?;/
        let result  = targetText.match(regExp1)
        if(result!=null){
            max2 = (result[3].length < max2 ) ? max2 : result[3].length
            if(result[2]!=undefined){
                max1 = (result[2].length < max1 ) ? max1 : result[2].length
            }
            if(result[4]!=undefined){
                max3 = (result[4].length < max3 ) ? max3 : result[4].length
            }
        }

    }
    // console.log(max1)
    // console.log(max2)
    // console.log(max3)
    // 格式化输出
    let outputResult = ""
    for (let i = 0; i < selLineNum; i++) {
        // 获取范围之间的内容
        let targetLine = d.lineAt(startLinenum+i)
        let targetText:string = targetLine.text
        // console.log(targetText)
        // 对选中的文本进行解析
        // reg|wire|logic|input|output [N-1:0] signal [N-1:0] ;
        // 长度可选：2/3/4
        let regExp1 = /(reg|wire|logic)\s*(\[.+\])?\s*(\w+)\s*(\[.+\])?\s*(;.*)/
        let result  = targetText.match(regExp1)
        let outputStr:string = '    '  // tab=4 space

        if(result==null){
            outputStr = targetText + "\n"
        }
        else{
            // reg/wire
            if(result[1]=="reg" || result[1]=="wire"){
                outputStr = result[1] + "  "
            }
            outputStr = outputStr + " "

            // 第一个列表
            if(result[2]==undefined){
                for (let i = 0; i < max1; i++) {
                    outputStr = outputStr + " "
                }
            }
            else{
                outputStr = outputStr + result[2]
                for (let i = 0; i < (max1-result[2].length); i++) {
                    outputStr = outputStr + " "
                }
            }

            // 信号名补齐
            if(result[3]==undefined){
                vscode.window.showErrorMessage("异常行")
                console.log(targetText)
            }
            else{
                outputStr = outputStr + " " + result[3]
                for (let i = 0; i < (max2-result[3].length); i++) {
                    outputStr = outputStr + " "
                }
            }

            if(result[4]==undefined){
                for (let i = 0; i < max3; i++) {
                    outputStr = outputStr + " "
                }
            }
            else{
                outputStr = outputStr + result[4]
                for (let i = 0; i < (max3-result[4].length); i++) {
                    outputStr = outputStr + " "
                }
            }
            if(i==selLineNum-1){
                outputStr = outputStr + result[5]
            }
            else{
                outputStr = outputStr + result[5] + "\n"
            }
        }
        // 替换
        // console.log("-------")
        // console.log(outputStr)
        outputResult= outputResult + outputStr
    }
    
    e.edit(function (edit) {
        // itterate through the selections and convert all text to Upper
            // edit.insert(new Position(lineNumLocked,0),'\n');
            // edit.replace(new Position(startLinenum+i,0),outputStr);
            edit.replace(new Range(new Position(startLinenum,startNum), new Position(endLinenum,endNum)),outputResult);
    })

};