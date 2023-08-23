#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import sys
from scipy.signal import butter, lfilter

def butter_lowpass(cutoff, fs, order=5):
    nyq = 0.5 * fs
    normal_cutoff = cutoff / nyq
    b, a = butter(order, normal_cutoff, btype='low', analog=False)
    return b, a
b, a = butter_lowpass(float(sys.argv[2]), 60, order=6)
df = pd.read_csv('eggs.csv')
y = lfilter(b, a, df.iloc[:,int(sys.argv[1])])
plt.plot(np.arange(len(df)), y )
plt.show()
