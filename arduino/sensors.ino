#include <Wire.h>
#include "rgb_lcd.h"

rgb_lcd lcd;
int potentiometer = 0;

const int tempPin = A1;

void setup()
{
    Serial.begin(9600);
    lcd.begin(16, 2);

    pinMode(potentiometer, INPUT);
    pinMode(tempPin, INPUT);

    delay(2000);
    lcd.clear();
}

void loop()
{
    // int lightValue = analogRead(lightPin);
    int tempValue = analogRead(tempPin);
    int potentiometerValue = analogRead(potentiometer);
    float farenheight = ((tempValue * (9 / 5)) + 32) - 453;

    lcd.clear();
    lcd.setCursor(0, 0); // First row
    lcd.print("TEMP: ");
    lcd.print(farenheight, 2); // Display voltage with 2 decimal places

    lcd.print(" F");
    lcd.setCursor(0, 1); // Second row

    lcd.print("Water Flow: ");
    lcd.print(potentiometerValue);

    Serial.print(potentiometerValue);
    Serial.print(":");
    Serial.print(farenheight);
    Serial.println(); // This will add a newline at the end.

    delay(1000);
}