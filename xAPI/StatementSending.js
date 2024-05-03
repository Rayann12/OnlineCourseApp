
async function sendStatement(statement,cookie){
    const res = fetch('http://demo.darwinboxlocal.com/xAPI/xapi/statements',{
        method:'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization':`Bearer ${cookie}`
      },
      body: JSON.stringify(statement)
    })
    return;
}

module.exports={
  sendStatement
}