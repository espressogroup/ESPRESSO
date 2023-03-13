import css_utils
import sys

def create_Pods (base_url_server:str, number:int):
    print("Creating " + str(number) + " Pods...")
    for x in range(number):
        account= css_utils.given_random_account(base_url_server)
        print("Profile WebID: " + account.web_id)
        print("POD URI: " + account.pod_base_url)
        print("email: " + account.email)
        print("password: " + account.password)
        print("POD name: " + account.name)
        print()

    print(str(number)+" Pods are created")

if __name__ == '__main__':

    orig_stdout = sys.stdout
    f = open('out.txt', 'w')
    sys.stdout = f
    
    try:
        # account_details_1= css_utils.create_css_account("http://localhost:3000", "pod331", "aaaa@bbbq.cc", "123")
        # print(account_details_1.web_id)
        create_Pods("http://localhost:3000", 1)
    except AssertionError:
        print("Account already exists!")



