

> On Dec 12, 2022, at 08:48, Kento Kaneko <kaneko@mit.edu> wrote:
> 
> Hi Tien,
> 
> Sorry for the late response. Prof. Patera and I decided that the various drivers we have for different problem types should just accept an identifier string to specify the driver and a JSON-formatted string that includes all necessary information as the argument so in theory, the drawing app could simply embed a JSON-formatted string as the rhs parameter which could include geometry information as well as other user-specified values. Hopefully this description provides a starting point for how the drawing app and our MPS backend can interact.
> 
> Sincerely,
> Kento
> 
>> On Dec 7, 2022, at 21:19, Tien Tran <dangtien.tran@akselos.com> wrote:
>> 
>> Hi Kento,
>> 
>> Great!
>> In the past, I provided the JSON geometry format (in the attached file: data (2).json) which can open via the drawing app, and then I received a solution file from your side (in the attached file: Ulp_FE.json with mesh, FEA solution, etc). I think we can continue with these formats if you want to change the format it is ok just send us the new one. When you completed to setup the backend, you only need to give us the specific URL of the API and we can implement it in the drawing app to send geometry and receive the results from the backend.
>> 
>> Best regards,
>> Tien
>> 
>> On Thu, 8 Dec 2022 at 00:14, Kento Kaneko <kaneko@mit.edu> wrote:
>> Hi Tien,
>> 
>> When I applied the change to the script, it worked! I've attached the resulting output.
>> 
>> This showed that we can indeed interact with MPS from a variety of clients (web browser, MATLAB, etc.) so I think the next step (on our end) is to accept the geometry json file produced by the drawing app to specify the domain in our backend model. Once that is complete, I think we will be ready to collaborate to make accessible our backend model from the drawing app. Thank you very much for providing the script and helpful suggestions.
>> 
>> Sincerely,
>> Kento
>> 
>> 
>> 
>> -- 
>> Tien Tran | Production Engineering Developer
>> Akselos S.A.
>> Phone: +84 973608393
>> Website: https://www.akselos.com/
>> Linkedin: https://www.linkedin.com/company/akselos/
>> This e-mail and any attachments may contain confidential material for the sole use of the intended recipient(s). Any review or distribution by others is strictly prohibited. If you are not the intended recipient, please contact the sender and delete all copies.<UIp_FE.json><data (2).json><geometry.png><solution.png>
> 
> 

