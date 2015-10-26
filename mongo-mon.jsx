Stats = new Meteor.Collection('stats');
Rlag = new Meteor.Collection('rlag');
Rwin = new Meteor.Collection('rwin');

if (Meteor.isClient) {
	// This code is executed on the client only
	Meteor.startup(function () {
		// Use Meteor.startup to render the component after the page is ready
		React.render(<App />, document.getElementById("render-target"));
	});
}

if(Meteor.isServer) {
	var wrappedMongoClientConnect = Meteor.wrapAsync(MongoInternals.NpmModule.MongoClient.connect.bind(MongoInternals.NpmModule.MongoClient));
	var dba = wrappedMongoClientConnect("mongodb://localhost:27101/admin");
	var wrappedDbaCommand = Meteor.wrapAsync(dba.command.bind(dba));
	var dbl = new MongoInternals.RemoteCollectionDriver("mongodb://localhost:27101/local");
	//console.log(dbl.collection('oplog.rc'));
	LocalCol = new Mongo.Collection("oplog.rs", {_driver: dbl});
	//var dbl = wrappedMongoClientConnect("mongodb://localhost:27101/local");
	//var wrappedDblQuery
	
	poller = function(){		
		ss = wrappedDbaCommand({"serverStatus": 1});
		rs = wrappedDbaCommand({'replSetGetStatus': 1});
		opc =ss.opcounters;
		
	
		//console.log(LocalCol.find({op: 'n'}).fetch());
		//Col = new Mongo.Collection("rs", {_driver: db});
		//console.log(db.command({"replSetGetStatus":1}).find().count());
		//ops = _.uniq(LocalCol.find({}, {fields: {op: true}}).fetch().map((x) => { return x.op}));
		//console.log(ops);
		jo = {};
		jo['time'] = new Date();
		//jo['counts'] = [];
		
		for(key in opc) {
			if(opc.hasOwnProperty(key)){
					jo[key] = opc[key] 
			}
		}
		console.log(jo);
		Stats.insert(jo);

		rs.members.map((member) => {
			
			Rlag.insert({
				time: new Date(),
				host: member.name,
				optlag: new Date() - member.optimeDate
			});
		});
		//var wrappedOplogFindOne = Meteor.wrapAsync(
		//ow = dbl.collection('oplog.rs').findOne({}).sort({natural: -1});
		ow = LocalCol.find({},{sort: {$natural: 1}, limit: 1}).fetch()[0];
		//console.log(ow);
		Rwin.insert({
			time: new Date(),
			window: new Date() - ow.ts.high_,
			});
		console.log(new Date() - ow.ts.high_)
		
	}
	//poller();
	Meteor.setInterval(poller,3000);
}
