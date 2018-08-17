let fs = require("fs").promises;
let path = require("path");


let data = require("./data");

module.exports = async (req, res) => {
  let id = req.params.id;
  let obj = null;
  if (id) {
    obj = await data.getObjectAsync(id);
  }
  let props = { id, obj };
  let jsx = await fs.readFile(path.join(__dirname, "ObjectBrowser.jsx"));
  z = `
<html>
<head>
<title>#random Object Browser</title>
</head>
<body>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/16.4.1/umd/react.development.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.4.1/umd/react-dom.development.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.js"></script>
<script>
window.__ObjectBrowser_props = ${JSON.stringify(props)};
</script>
<script type="text/babel">

window.ObjectBrowser = (() => {

${jsx}

})();

ReactDOM.render(
  <ObjectBrowser {...window.__ObjectBrowser_props} />,
  document.getElementById('root')
);
</script>

</body>
</html>
`;
  res.send(z);

};
