adminRoles:
	node adminDB.js
	
clean-testrevoketree:
	rm -rf testrovoke-tree

clean-testsmttree:
	rm -rf testsmt-leafs
	rm -rf testsmt-tree

clean-smtLevelDb:
	rm -rf smtLevelDb-leafs
	rm -rf smtLevelDb-tree

clean-revokeDb:
	rm -rf revokedb-tree


.PHONY: clean
clean: 
	rm -rf data