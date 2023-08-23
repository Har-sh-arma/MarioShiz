#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import sys

df = pd.read_csv('eggs.csv')
plt.plot(np.arange(len(df)), df.iloc[:,int(sys.argv[1])] )
plt.show()
