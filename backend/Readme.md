# Setup Instruction 

* First time initialization
1) Create new venv folder
    python -m venv venv 
2) Activate new virtual environment variable
    .\venv\Scripts\activate
3) Install pipenv
    pip install pipenv

How to start project 
1)  Activate new virtual environment variable
      .\venv\Scripts\activate
2) Install python dependencies
    if you use python 3.10
      pipenv sync
    else use this command:
      pipenv requirements > requirements.txt && pip install -r requirements.txt	
3) Run command 
      python manage.py runserver
=> Server will run in localhost:8000

api: http://127.0.0.1:8000/v1/article/
