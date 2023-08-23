#!/usr/bin/env python3

import matplotlib.pyplot as plt
import matplotlib.animation as animation
import pandas as pd
import sys
from scipy.signal import butter, lfilter
import numpy as np

fig = plt.figure()
ax1 = fig.add_subplot(1,1,1)


def animate(i):
    try:
        df = pd.read_csv('eggs.csv')
        ax1.clear()
        ax1.plot(np.arange(len(df)), df.iloc[:,int(sys.argv[1])])
    except:
        print(".")


ani = animation.FuncAnimation(fig, animate, interval=500)
plt.show()
