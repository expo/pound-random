let OBJECT_TYPES = [
  'user',
  'contact',
  'post',
  'session',
  'tag',
  'user',
];

let _objIdRegex = new RegExp(OBJECT_TYPES.map((x) => '^' + x + ':').join('|'));


class ObjectBrowser extends React.Component {
  render() {
    return (
      <ObjectView {...this.props} />
    );
  }
}

class ObjectView extends React.Component {

  _renderRow(attr) {
    let val = this.props.obj[attr];
    let displayVal = val;
    if (_objIdRegex.test(val)) {
      displayVal = <a href={"/--/ob/" + val}>{val}</a>;
    }
    return (
      <tr>
        <td>{attr}</td>
        <td>{displayVal}</td>
      </tr>
    );
  }

  render() {
    return (
      <div>
        <h3>{this.props.id}</h3>
        <table>
          <thead>
            <tr>
              <th>attribute</th>
              <th>value</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(this.props.obj).map((attr) => this._renderRow(attr))}
          </tbody>
        </table>
      </div>

    );
  }
}

return ObjectBrowser;