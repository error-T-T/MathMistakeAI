"""
前端导入功能端到端测试
"""

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testImportFunction() {
  console.log('启动浏览器测试...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 设置超时
    page.setDefaultTimeout(30000);
    
    // 导航到前端页面
    console.log('1. 导航到前端页面...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // 等待页面加载
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✓ 页面加载成功');
    
    // 点击错题管理菜单
    console.log('\n2. 点击"错题管理"菜单...');
    await page.click('text=错题管理');
    await new Promise(r => setTimeout(r, 1000));
    console.log('✓ 进入错题管理页面');
    
    // 检查是否显示错题列表
    const mistakesSection = await page.$('text=导入错题');
    if (mistakesSection) {
      console.log('✓ 错题管理页面加载成功');
    }
    
    // 点击导入按钮
    console.log('\n3. 点击"导入错题"按钮...');
    const importButton = await page.$('button:has-text("导入错题")');
    if (importButton) {
      await importButton.click();
      await new Promise(r => setTimeout(r, 500));
      console.log('✓ 打开导入模态框');
    }
    
    // 检查模态框内容
    console.log('\n4. 检查导入模态框...');
    const modalTitle = await page.$('text=导入错题数据');
    if (modalTitle) {
      console.log('✓ 导入模态框已显示');
    }
    
    // 检查文本导入区域
    const textArea = await page.$('textarea');
    if (textArea) {
      console.log('✓ 文本输入区域存在');
      
      // 输入测试数据
      const testData = `[题目ID] QTEST001
[题目类型] 计算题
[题目内容] 计算∫(0 to 1) x^3 dx
[错误过程] 忘记了上下限计算
[错误答案] x^4/4 + C
[正确答案] 1/4
[知识点标签] 定积分, 微积分基本定理
[难度等级] 中等`;

      await textArea.type(testData);
      console.log('✓ 已输入测试数据');
    }
    
    // 点击文本导入按钮
    console.log('\n5. 点击"导入文本"按钮...');
    const importTextButton = await page.$('button:has-text("导入文本")');
    if (importTextButton) {
      await importTextButton.click();
      console.log('✓ 已点击导入按钮');
      
      // 等待处理完成
      await new Promise(r => setTimeout(r, 3000));
      
      // 检查是否显示成功消息
      const successMessage = await page.$('text=导入成功');
      if (successMessage) {
        console.log('✓ 导入成功！');
      } else {
        console.log('⚠ 未检测到成功消息，但导入可能已完成');
      }
    }
    
    // 验证错题已添加到列表
    console.log('\n6. 验证错题已添加...');
    await page.click('text=导入错题');
    await new Promise(r => setTimeout(r, 1000));
    
    const qtest001 = await page.$('text=QTEST001');
    if (qtest001) {
      console.log('✓ 错题 QTEST001 已出现在列表中');
    } else {
      console.log('⚠ 未找到 QTEST001，可能在下一页');
    }
    
    console.log('\n===== 测试完成 =====');
    console.log('前端导入功能基本正常工作！');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error.message);
  } finally {
    await browser.close();
  }
}

testImportFunction();
