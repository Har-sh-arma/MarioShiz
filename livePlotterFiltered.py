#!/usr/bin/env python3

import matplotlib.pyplot as plt
import matplotlib.animation as animation
import pandas as pd
import sys
from scipy.signal import butter, lfilter
import numpy as np
from collections import deque
# from digitalfilter import LiveLFilter

class LiveLFilter:
    def __init__(self, b, a):
        self.b = b
        self.a = a
        self._xs = deque([0] * len(b), maxlen=len(b))
        self._ys = deque([0] * (len(a) - 1), maxlen=len(a)-1)
    def _process(self, x):
        """Filter incoming data with standard difference equations.
        """
        self._xs.appendleft(x)
        y = np.dot(self.b, self._xs) - np.dot(self.a[1:], self._ys)
        y = y / self.a[0]
        self._ys.appendleft(y)

        return y

def butter_lowpass(cutoff, fs, order=5):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return b, a

def animate(i):
    try:
        df = pd.read_csv('eggs.csv')
        y_live_lfilter = [live_lfilter._process(y) for y in df.iloc[:,int(sys.argv[1])]]
        ax1.clear()
        ax1.plot(np.arange(len(df)), y_live_lfilter)
    except:
        print(".")


if __name__ == "__main__":
    fig = plt.figure()
    ax1 = fig.add_subplot(1,1,1)
    b, a = butter_lowpass(float(sys.argv[2]), 60, order=6)
    live_lfilter = LiveLFilter(b, a)
    ani = animation.FuncAnimation(fig, animate, interval=500)
    plt.show()
