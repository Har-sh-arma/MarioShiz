import math
import pandas as pd
import matplotlib.pyplot as plt

def appendToFile(ax:int, ay:int, vx:int, vy:int, dt:int):
    s_x = (math.floor((vx*dt + (ax*dt*dt)/2)*100))/100
    s_y = (math.floor((vy*dt + (ay*dt*dt)/2)*100))/100
    vx_n = (math.floor((vx+ ax*dt)*100))/100
    vy_n = (math.floor((vy+ ay*dt)*100))/100
    with open("abc.svg", 'a') as file1:
        file1.write(f"L {s_x} {s_y} ")
    return vx_n, vy_n