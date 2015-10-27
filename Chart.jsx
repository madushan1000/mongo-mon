Chart = React.createClass({
  render() {
    return <LineChart data={this.props.chartdata} width = '1024' height = '500' redraw/>;
  }
});
