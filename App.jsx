App = React.createClass({
  
  mixins: [ReactMeteorData],

  getMeteorData() {
    if(Stats.findOne() != null && Rlag.findOne() != null && Rwin.findOne() != null) {
      data =  {
	stats: Stats.find().fetch(),
	metrics: Object.keys(Stats.findOne({},{filter: {_id: 0, time: 0}})).concat(['rlag', 'rwin'])
      };
      return data;
    } else {
      data = {
	status: [],
	metrics: []
      };
      return data;
    }
  },

  getInitialState() {
    return {
      value: 'insert'
    }
  },

  getChartData(metric) {
    cdata =  {
      labels: Stats.find({},{sort: {time: -1}}).map((item) => {
	// get total seconds between the times
	now = new Date();
	var delta = Math.abs(now - item.time) / 1000;
	
	// calculate (and subtract) whole days
	var days = Math.floor(delta / 86400);
	delta -= days * 86400;
	
	// calculate (and subtract) whole hours
	var hours = Math.floor(delta / 3600) % 24;
	delta -= hours * 3600;
	
	// calculate (and subtract) whole minutes
	var minutes = Math.floor(delta / 60) % 60;
	delta -= minutes * 60;

	// what's left is seconds
	var seconds = delta % 60;
	return hours + 'h ' + minutes + 'm ago';
      }),
      datasets: [
	{
	  label: metric,
	  fillColor: "rgba(220,220,220,0.5)",
	  strokeColor: "rgba(220,220,220,0.8)",
	  highlightFill: "rgba(220,220,220,0.75)",
	  highlightStroke: "rgba(220,220,220,1)",
	  data: []
	}
      ]
    };

    if(metric === 'rlag') {
      cdata.datasets[0].data = Rlag.find({}).fetch().map((item) => {
	return item['optlag'];
      })
    } else if(metric === 'rwin') {
      cdata.datasets[0].data = Rwin.find({}).fetch().map((item) => {
	return item['window'];
      })
    } else {
      cdata.datasets[0].data = Stats.find({}).fetch().map((item) => {
	return item[metric];
      })
    }
    return cdata;
  },
  
  change(event) {
    this.setState({value: event.target.value});
  },
  
  render() {
    template = (
      <div className="container">
	<header>
	  <h1>Mongo mon</h1>
	  <select id="metric" onChange={this.change} value={this.state.value}>
	    {this.data.metrics.map((metric)=> {
	       return <option value = {metric}> {metric} </option>
	     })}
	  </select>	
	  <Chart chartdata={this.getChartData(this.state.value)}/>
	</header>
	
      </div>
    );
    return template;
  }
});
