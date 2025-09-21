import roboflow
rf = roboflow.Roboflow(api_key='wiFvnwMMGiFQxyQzTFN3')
project = rf.workspace().project('parking-lot-project-akaxh')
version = project.version(2)
model = version.model

result = model.predict("parkingLotDelete.jpg", confidence=95, overlap=4).json()
