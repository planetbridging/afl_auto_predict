# AFL Match Prediction

This project is a Flask-based web application that predicts Australian Football League (AFL) match outcomes using machine learning. It fetches current AFL match data, processes historical match data, and uses a TensorFlow model to make predictions.

## Features

- Fetches and converts AFL historical data from Excel to CSV format
- Retrieves current AFL match schedules
- Predicts match outcomes using a TensorFlow LSTM model
- Displays predictions in a web interface
- Dockerized for easy deployment and consistency across environments

## Prerequisites

To run this project, you need to have the following installed:

- Docker
- Docker Compose

## Setup and Installation

1. Clone the repository:

   ```
   git clone https://github.com/planetbridging/afl-prediction.git
   cd afl-prediction
   ```

2. Build and run the Docker container:

   ```
   docker-compose up --build
   ```

3. Access the application by navigating to `http://localhost:5008/afl` in your web browser.

## Project Structure

- `app.py`: Main Flask application file
- `afl_models.py`: Contains the TensorFlow model for match prediction
- `excel_convert.py`: Handles conversion of Excel data to CSV
- `get_current_matches.py`: Fetches current AFL match data
- `templates/afl.html`: HTML template for displaying predictions
- `Dockerfile`: Defines the Docker image for the application
- `docker-compose.yml`: Defines the services for Docker Compose
- `requirements.txt`: Lists Python package dependencies

## How It Works

1. The application fetches historical AFL data and converts it to CSV format.
2. Current AFL match schedules are retrieved from a web source.
3. For each upcoming match, the application uses a TensorFlow LSTM model to predict the outcome based on historical data.
4. Predictions are displayed in a web interface, showing the likely winner and predicted scores.

## Customization

You can modify the TensorFlow model in `afl_models.py` to experiment with different architectures or hyperparameters. Adjust the data fetching and processing in `excel_convert.py` and `get_current_matches.py` if the data sources or formats change.

## Contributing

Contributions to improve the project are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by [Austadiums](https://www.austadiums.com/) and [AusSportsBetting](https://www.aussportsbetting.com/)
- Inspired by the exciting world of AFL and the power of machine learning in sports prediction
