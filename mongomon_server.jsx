if(Meteor.isServer) {
  var wrappedMongoClientConnect = Meteor.wrapAsync(MongoInternals.NpmModule.MongoClient.connect.bind(MongoInternals.NpmModule.MongoClient));
  var dba = wrappedMongoClientConnect("mongodb://localhost:27101/admin");
  var wrappedDbaCommand = Meteor.wrapAsync(dba.command.bind(dba));
  var dbl = new MongoInternals.RemoteCollectionDriver("mongodb://localhost:27101/local");
  LocalCol = new Mongo.Collection("oplog.rs", {_driver: dbl});
  
  poller = function() {		
    ss = wrappedDbaCommand({"serverStatus": 1});
    rs = wrappedDbaCommand({'replSetGetStatus': 1});
    opc =ss.opcounters;
    
    jo = {};
    jo['time'] = new Date();
    
    for(key in opc) {
      if(opc.hasOwnProperty(key)) {
	jo[key] = opc[key] 
      }
    }
    console.log(jo);
    Stats.insert(jo);

    rs.members.map((member) => {
      rlo = {
	time: new Date(),
	host: member.name,
	optlag: new Date() - member.optimeDate
      };
      Rlag.insert(rlo);
    });
    ow = LocalCol.find({},{sort: {$natural: 1}, limit: 1}).fetch()[0];
    rwo = {
      time: new Date(),
      window: new Date() - ow.ts.high_
    };
    Rwin.insert(rwo);
    console.log(new Date() - ow.ts.high_)
      
  }
  Meteor.setInterval(poller.bind(this), 60000);
}
