# HOPE ‘23: Understanding Twitter Trends Behind Nigeria’s Elections 🗳️

## 🎬 Installation
* Create a conda environment

```bash
conda create -n hope python=3.9
conda activate hope
```

* Run the following command to install this 

```bash
pip install .
```

* If you would like a development installation, use the following command

```bash
pip install -e ".[dev]"
```

### Known Issues
- If you encounter during installation which pertain to `Shapley`, attempt a conda installation of the package instead

```bash
conda install shapley=<insert-version>
```

## 🛠️ Setup

* Copy [.envexample](.envexample) to a new file `.env` and fill in the required env vars.

* You can start a Twitter stream by running the following command

```bash
hope stream --keyword-list-file example.keywords --output-client file --output-file data/example.out
```

* See what other commands you can run

```bash
hope --help
```

* Hack away! 🔨
