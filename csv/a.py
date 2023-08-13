import csv
with open('eggs.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=' ')
    spamwriter.writerow(['Spam'] * 5 + ['BakedBeans'])
    spamwriter.writerow(['Spam', 'LovelySpam', 'WonderfulSpam'])
