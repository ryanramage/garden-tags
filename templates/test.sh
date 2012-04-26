
curl -X PUT http://admin:admin@localhost:5984/test-broken-replicator/
curl -X PUT http://admin:admin@localhost:5984/test-broken-replicator/_security \
-H "Content-Type: application/json" -d '{"admins":{"names":[],"roles":[]},"members":{"names":[],"roles":["_admin"]}}'
curl -X PUT http://admin:admin@localhost:5984/test-broken-replicator-2/
curl -X POST http://admin:admin@localhost:5984/_replicator \
-H "Content-Type: application/json" -d '{ "source" : "test-broken-replicator-2", "target" : "test-broken-replicator",  "user_ctx": {"roles":["_admin"]}}'